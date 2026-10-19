// Run against the production export. No external services or network data are used.
// Pass --playwright-module /absolute/path/to/playwright/index.mjs if it is not installed locally.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";
const moduleFlag = process.argv.indexOf("--playwright-module");
const modulePath =
  moduleFlag >= 0 ? process.argv[moduleFlag + 1] : "playwright";
const { chromium, webkit } = await import(
  modulePath.startsWith("/") ? pathToFileURL(modulePath).href : modulePath
);
const root = resolve("dist");
const scratch = resolve("test/scratch/interaction");
await mkdir(scratch, { recursive: true });
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://local").pathname,
    );
    if (!pathname.startsWith("/preview/")) {
      res.writeHead(404).end();
      return;
    }
    const target = resolve(
      root,
      pathname.slice("/preview/".length) || "index.html",
    );
    if (target !== root && !target.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const bytes = await readFile(target);
    res.writeHead(200, {
      "content-type": mime[extname(target)] ?? "application/octet-stream",
    });
    res.end(bytes);
  } catch {
    if (!res.headersSent) res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/preview/`;
const results = [];
const browsers = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
};
const cards = (page) => page.locator("article.post");
const count = async (page, expected) =>
  assert.equal(await cards(page).count(), expected);
async function visible(locator) {
  assert.equal(await locator.isVisible(), true);
}
async function setup(type, width = 390) {
  const browser = await type.launch({ headless: true });
  browsers.push(browser);
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 1,
  });
  const errors = [],
    failed = [],
    external = [];
  await context.route("**/*", async (route) => {
    if (
      route.request().url().startsWith(base) ||
      route.request().url().startsWith("data:")
    )
      await route.continue();
    else {
      external.push(route.request().url());
      await route.abort();
    }
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      failed.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  return { browser, context, page, errors, failed, external };
}
try {
  const { page, context, errors, failed, external } = await setup(chromium);
  await check(
    "Static subpath loads eight posts, a local font and every runtime asset",
    async () => {
      await count(page, 8);
      assert.equal(
        await page.evaluate(() => document.fonts.check("400 16px Manrope")),
        true,
      );
      assert.deepEqual(errors, []);
      assert.deepEqual(failed, []);
      assert.deepEqual(external, []);
      assert.equal(
        await cards(page).first().getAttribute("data-post-id"),
        "contract-jobs",
      );
      const share = await context.request.get(base + "images/share-card.png");
      assert.equal(share.status(), 200);
      assert.ok((await share.body()).length > 5000);
    },
  );
  await check(
    "At 390 × 844, search, topic controls and the first complete post action are visible",
    async () => {
      for (const selector of [
        "#search",
        ".category-tabs",
        "article.post:first-child .post-copy",
        "article.post:first-child .find-post",
      ]) {
        const box = await page.locator(selector).boundingBox();
        assert.ok(
          box && box.y >= 0 && box.y + box.height <= 844,
          `${selector} is outside first screen`,
        );
      }
      await page.screenshot({ path: `${scratch}/390.png` });
    },
  );
  await check(
    "Topic filters show Building 4, Ideas 2, Community 2 and All posts 8",
    async () => {
      for (const [name, total] of [
        ["Building", 4],
        ["Ideas", 2],
        ["Community", 2],
        ["All posts", 8],
      ]) {
        const button = page.getByRole("button", { name, exact: true });
        await button.click();
        await count(page, total);
        assert.equal(await button.getAttribute("aria-pressed"), "true");
      }
    },
  );
  await check(
    "Search matches text, author and handle, ignoring case and outer whitespace",
    async () => {
      for (const [query, total] of [
        ["callback", 1],
        ["PREM", 2],
        ["@nxt3d", 2],
        ["  CALLBACK  ", 1],
      ]) {
        await page.getByLabel("Search the collection").fill(query);
        await count(page, total);
      }
      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await count(page, 8);
      assert.equal(
        await page
          .locator("#search")
          .evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  await check(
    "Search and category combine; empty results offer a working reset",
    async () => {
      await page.getByRole("button", { name: "Ideas", exact: true }).click();
      await page.getByLabel("Search the collection").fill("callback");
      await count(page, 0);
      await visible(
        page.getByRole("heading", { name: "No posts match this search" }),
      );
      await page
        .getByRole("button", { name: "Clear filters", exact: true })
        .click();
      await count(page, 8);
    },
  );
  await check(
    "Likes, relative source age and repost sorting use captured values",
    async () => {
      await page.getByLabel("Sort posts").selectOption("newest");
      assert.equal(
        await cards(page).first().getAttribute("data-post-id"),
        "what-is-a-swarm",
      );
      await page.getByLabel("Sort posts").selectOption("reposts");
      assert.equal(
        await cards(page).first().getAttribute("data-post-id"),
        "contract-jobs",
      );
      await page.getByLabel("Sort posts").selectOption("likes");
      assert.equal(
        await cards(page).nth(1).getAttribute("data-post-id"),
        "launch-form",
      );
    },
  );
  await check(
    "Bookmark toggles, updates the count and persists after reload",
    async () => {
      await page
        .getByRole("button", { name: "Save post by Adam", exact: true })
        .first()
        .click();
      assert.equal(await page.locator(".saved-count").textContent(), "1");
      await page.reload();
      await count(page, 8);
      assert.equal(
        await page
          .locator('[data-post-id="contract-jobs"] .save-post')
          .getAttribute("aria-pressed"),
        "true",
      );
    },
  );
  await check(
    "Saved view contains only bookmarks; removal reveals a useful empty state",
    async () => {
      await page.locator('.main-nav a[href="#saved"]').click();
      await count(page, 1);
      await visible(
        page.getByRole("heading", { name: "Saved tweets", exact: true }),
      );
      await page
        .getByRole("button", { name: "Unsave post by Adam", exact: true })
        .click();
      await count(page, 0);
      await visible(
        page.getByRole("heading", { name: "A little signal for later" }),
      );
      await page
        .getByRole("link", { name: "Explore the feed", exact: true })
        .click();
      await count(page, 8);
    },
  );
  await check(
    "Back/forward hash navigation restores feed and saved views",
    async () => {
      await page.goBack();
      await visible(
        page.getByRole("heading", { name: "Saved tweets", exact: true }),
      );
      await page.goForward();
      await visible(
        page.getByRole("heading", { name: "Top tweets", exact: true }),
      );
    },
  );
  await check(
    "Source notes open, trap keyboard focus and restore it after Escape",
    async () => {
      const trigger = page.getByRole("button", {
        name: "How it works",
        exact: true,
      });
      await trigger.click();
      await visible(page.getByRole("dialog"));
      assert.equal(
        await page.evaluate(
          () => document.activeElement?.closest("dialog") !== null,
        ),
        true,
      );
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
        assert.equal(
          await page.evaluate(
            () => document.activeElement?.closest("dialog") !== null,
          ),
          true,
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("dialog").evaluate((el) => el.open),
        false,
      );
      assert.equal(
        await trigger.evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  await check("Source notes dismiss via close, done and backdrop", async () => {
    const open = () =>
      page.getByRole("button", { name: "How it works", exact: true }).click();
    await open();
    await page
      .getByRole("button", { name: "Close collection information" })
      .click();
    assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
    await open();
    await page
      .getByRole("button", { name: "Back to the feed", exact: true })
      .click();
    await open();
    await page.mouse.click(2, 2);
    assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
  });
  await check(
    "Keyboard activates topic buttons and bookmark controls with visible focus",
    async () => {
      const topic = page.getByRole("button", {
        name: "Community",
        exact: true,
      });
      await page.keyboard.press("Tab");
      await topic.focus();
      assert.equal(
        await topic.evaluate((el) => getComputedStyle(el).outlineStyle),
        "solid",
      );
      await page.keyboard.press("Space");
      await count(page, 2);
      const save = cards(page)
        .first()
        .getByRole("button", { name: "Save post by Jose", exact: true });
      await save.focus();
      await page.keyboard.press("Space");
      assert.equal(await page.locator(".saved-count").textContent(), "1");
      await page
        .getByRole("button", { name: "All posts", exact: true })
        .click();
    },
  );
  await check(
    "Every post provides an author-filtered X search and a real source mirror URL",
    async () => {
      for (const link of await page.locator(".find-post").all()) {
        const u = new URL(await link.getAttribute("href"));
        assert.equal(u.origin, "https://x.com");
        assert.equal(u.pathname, "/search");
        assert.ok(u.searchParams.get("q").startsWith("from:"));
      }
      for (const link of await page.locator(".source-link").all())
        assert.ok(
          (await link.getAttribute("href")).startsWith(
            "https://www.sotwe.com/",
          ),
        );
    },
  );
  await check(
    "Copy succeeds with browser permission and copies the actual X search URL",
    async () => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page
        .getByRole("button", {
          name: "Copy X search link for Adam's post",
          exact: true,
        })
        .first()
        .click();
      await page
        .getByText("Copied the X search link for Adam's post.", { exact: true })
        .waitFor();
      assert.ok(
        (await page.evaluate(() => navigator.clipboard.readText())).includes(
          "from%3Asurfcoderepeat",
        ),
      );
    },
  );
  await check(
    "Copy denial gives a recovery message beside the feed",
    async () => {
      await page.evaluate(() => {
        Object.defineProperty(navigator.clipboard, "writeText", {
          configurable: true,
          value: () => Promise.reject(new Error("Denied for validation")),
        });
      });
      await page
        .getByRole("button", {
          name: "Copy X search link for Adam's post",
          exact: true,
        })
        .first()
        .click();
      await page
        .getByText(
          "Copy is unavailable. Use “Find on X” beside the copy button to open the post search.",
          { exact: true },
        )
        .waitFor();
    },
  );
  await check("Sidebar topics filter the feed", async () => {
    await page.locator(".topic-list button").nth(1).click();
    await count(page, 2);
    await page.getByRole("button", { name: "All posts", exact: true }).click();
  });
  await check(
    "No horizontal overflow at 320, 390, 620, 720, 820, 1050 and 1440",
    async () => {
      for (const width of [320, 390, 620, 720, 820, 1050, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          true,
          `overflow at ${width}`,
        );
      }
      await page.screenshot({ path: `${scratch}/1440.png`, fullPage: true });
    },
  );
  await check(
    "A long empty-state query wraps without clipping or overflow at 320",
    async () => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page.locator("#search").fill("unmatched".repeat(50));
      await count(page, 0);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page
        .getByRole("button", { name: "Clear filters", exact: true })
        .click();
    },
  );
  await check("Reduced motion disables transitions", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".primary-button")
        .first()
        .evaluate((el) => getComputedStyle(el).transitionDuration),
      "0s",
    );
  });
  await check(
    "Final runtime has no script errors, missing files or external requests",
    async () => {
      assert.deepEqual(errors, []);
      assert.deepEqual(failed, []);
      assert.deepEqual(external, []);
    },
  );
  const denied = await setup(chromium);
  await check(
    "Unavailable storage preserves working, explicitly session-only bookmarks",
    async () => {
      await denied.page.addInitScript(() => {
        Storage.prototype.getItem = () => {
          throw new Error("Denied for validation");
        };
        Storage.prototype.setItem = () => {
          throw new Error("Denied for validation");
        };
      });
      await denied.page.reload();
      await visible(
        denied.page.getByText(
          "Browser storage is unavailable. Saved posts will last for this visit.",
          { exact: true },
        ),
      );
      await denied.page
        .getByRole("button", { name: "Save post by Adam", exact: true })
        .first()
        .click();
      await denied.page.locator('.main-nav a[href="#saved"]').click();
      await count(denied.page, 1);
    },
  );
  let safari;
  try {
    safari = await setup(webkit);
  } catch (error) {
    results.push({
      name: "WebKit runtime",
      passed: null,
      limitation: error.message.split("\n")[0],
    });
    console.log("LIMITATION WebKit runtime unavailable.");
  }
  if (safari) {
    await check(
      "WebKit: initial feed, search, topics, bookmark and dialog",
      async () => {
        await count(safari.page, 8);
        await safari.page.locator("#search").fill("callback");
        await count(safari.page, 1);
        await safari.page
          .getByRole("button", { name: "Clear search", exact: true })
          .click();
        await safari.page
          .getByRole("button", { name: "Ideas", exact: true })
          .click();
        await count(safari.page, 2);
        await cards(safari.page).first().getByRole("button").first().click();
        assert.equal(
          await safari.page.locator(".saved-count").textContent(),
          "1",
        );
        await safari.page
          .getByRole("button", { name: "How it works", exact: true })
          .click();
        await visible(safari.page.getByRole("dialog"));
        await safari.page.keyboard.press("Escape");
        assert.deepEqual(safari.errors, []);
        assert.deepEqual(safari.failed, []);
      },
    );
  }
} finally {
  await Promise.all(browsers.map((browser) => browser.close()));
  await new Promise((r) => server.close(r));
  await writeFile(
    `${scratch}/results.json`,
    JSON.stringify(
      {
        passed: results.filter((r) => r.passed === true).length,
        failed: results.filter((r) => r.passed === false).length,
        results,
      },
      null,
      2,
    ) + "\n",
  );
}
console.log(
  `${results.filter((r) => r.passed === true).length} passed, ${results.filter((r) => r.passed === false).length} failed.`,
);
if (results.some((r) => r.passed === false)) process.exitCode = 1;
