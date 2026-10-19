import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CheckCheck,
  Code2,
  Copy,
  Heart,
  Info,
  Lightbulb,
  MessageCircle,
  Radio,
  Repeat2,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { CAPTURE_DATE, collectionSearch, posts, xSearchUrl } from "./posts";
import type { Category, Post } from "./posts";

const STORAGE_KEY = "swarm-signal:saved:v1";
const categories: ("All posts" | Category)[] = [
  "All posts",
  "Building",
  "Ideas",
  "Community",
];
const categoryIcons = {
  "All posts": Radio,
  Building: Code2,
  Ideas: Lightbulb,
  Community: Users,
};
type Sort = "likes" | "newest" | "reposts";

function loadSaved(): { ids: string[]; unavailable: boolean } {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return {
      ids: Array.isArray(stored)
        ? stored.filter(
            (id): id is string =>
              typeof id === "string" && posts.some((post) => post.id === id),
          )
        : [],
      unavailable: false,
    };
  } catch {
    return { ids: [], unavailable: true };
  }
}

function PostCard({
  post,
  rank,
  saved,
  onSave,
  onCopy,
}: {
  post: Post;
  rank: number;
  saved: boolean;
  onSave: () => void;
  onCopy: () => void;
}) {
  const CategoryIcon = categoryIcons[post.category];
  return (
    <article
      className="post"
      aria-labelledby={`author-${post.id}`}
      data-post-id={post.id}
    >
      <div className="post-topline">
        <span className="post-rank">
          <span className="rank-number">{String(rank).padStart(2, "0")}</span>
          <CategoryIcon size={14} />
          <span>{post.category}</span>
        </span>
        <span
          className="summary-label"
          title="Source summary and relative age reported at capture"
        >
          Summary · {post.ageDays}d at capture
        </span>
      </div>
      <div className="post-author">
        <span className={`avatar avatar-${post.color}`} aria-hidden="true">
          {post.initials}
        </span>
        <div className="author-name">
          <h3 id={`author-${post.id}`}>{post.name}</h3>
          <a
            href={`https://x.com/${post.handle}`}
            target="_blank"
            rel="noreferrer"
          >
            @{post.handle}
            <span className="sr-only"> on X (opens a new tab)</span>
          </a>
        </div>
        <button
          className={`icon-button save-post ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} post by ${post.name}`}
          aria-pressed={saved}
          onClick={onSave}
          title={saved ? "Remove from saved posts" : "Save in this browser"}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="post-copy">{post.summary}</p>
      <div className="post-bottom">
        <div className="post-metrics" role="group" aria-label="Engagement at capture">
          <span title={`${post.likes} likes`}>
            <Heart size={16} />
            <span>{post.likes}</span>
            <span className="sr-only"> likes</span>
          </span>
          <span title={`${post.reposts} reposts`}>
            <Repeat2 size={17} />
            <span>{post.reposts}</span>
            <span className="sr-only"> reposts</span>
          </span>
          <span title={`${post.replies} replies`}>
            <MessageCircle size={16} />
            <span>{post.replies}</span>
            <span className="sr-only"> replies</span>
          </span>
        </div>
        <div className="post-links">
          <button
            className="icon-button copy-button"
            aria-label={`Copy X search link for ${post.name}'s post`}
            onClick={onCopy}
            title="Copy X search link"
          >
            <Copy size={16} />
          </button>
          <a
            className="find-post"
            href={xSearchUrl(post)}
            target="_blank"
            rel="noreferrer"
          >
            Find on X<ArrowUpRight size={16} />
            <span className="sr-only">
              : {post.searchPhrase} (opens a new tab)
            </span>
          </a>
        </div>
      </div>
      <a
        className="source-link"
        href={post.source}
        target="_blank"
        rel="noreferrer"
      >
        Source: Sotwe <ArrowUpRight size={12} />
        <span className="sr-only">
          for {post.name}'s summary (opens a new tab)
        </span>
      </a>
    </article>
  );
}

function CollectionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="collection-dialog"
      aria-labelledby="about-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<
          HTMLButtonElement | HTMLAnchorElement
        >("button:not([disabled]), a[href]");
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <h2 id="about-title">About this collection</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close collection information"
            autoFocus
          >
            <X size={22} />
          </button>
        </div>
        <p>
          Swarm Signal is an independent reading list about identity.md, made
          for people following its builders and community.
        </p>
        <h3>A snapshot, with sources</h3>
        <p>
          Eight selected posts, captured on {CAPTURE_DATE}. Post text is
          summarized, not quoted. Engagement and relative post ages come from
          publicly readable Sotwe mirrors. They may be delayed and are not live
          X data.
        </p>
        <h3>What “top” means here</h3>
        <p>
          By default, posts are ranked by captured likes within this collection.
          This is a small editorial selection, not a ranking of all tweets. You
          can also sort by source age or reposts.
        </p>
        <h3>Read the originals</h3>
        <p>
          “Find on X” opens an author-and-text search because stable post
          permalinks could not be verified. X may ask you to sign in. Every card
          also links to the source mirror.
        </p>
        <h3>Saved in this browser</h3>
        <p>
          Bookmarks are stored on this device. There is no account or
          cross-device sync. Clearing browser data removes them.
        </p>
        <div className="source-list">
          <span>Collection sources</span>
          <a
            href="https://www.sotwe.com/imdradar"
            target="_blank"
            rel="noreferrer"
          >
            IMD Radar on Sotwe <ArrowUpRight size={16} />
          </a>
          <a
            href="https://www.sotwe.com/nxt3d"
            target="_blank"
            rel="noreferrer"
          >
            Prem Makeig on Sotwe <ArrowUpRight size={16} />
          </a>
        </div>
        <button className="primary-button dialog-done" onClick={onClose}>
          Back to the feed
          <ArrowRight size={17} />
        </button>
      </div>
    </dialog>
  );
}

export default function App() {
  const [savedState, setSavedState] = useState(loadSaved);
  const [view, setView] = useState<"feed" | "saved">(() =>
    location.hash === "#saved" ? "saved" : "feed",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All posts" | Category>("All posts");
  const [sort, setSort] = useState<Sort>("likes");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const feedTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const changeView = () => {
      setView(location.hash === "#saved" ? "saved" : "feed");
      setQuery("");
      setCategory("All posts");
    };
    window.addEventListener("hashchange", changeView);
    const syncSaved = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setSavedState(loadSaved());
    };
    window.addEventListener("storage", syncSaved);
    return () => {
      window.removeEventListener("hashchange", changeView);
      window.removeEventListener("storage", syncSaved);
    };
  }, []);

  const scopedPosts =
    view === "saved"
      ? posts.filter((post) => savedState.ids.includes(post.id))
      : posts;
  const filtered = useMemo(
    () =>
      scopedPosts
        .filter((post) => {
          const text =
            `${post.name} @${post.handle} ${post.summary} ${post.category}`.toLocaleLowerCase();
          return (
            (category === "All posts" || post.category === category) &&
            text.includes(query.trim().toLocaleLowerCase())
          );
        })
        .sort((a, b) =>
          sort === "newest"
            ? a.ageDays - b.ageDays || b.likes - a.likes
            : sort === "reposts"
              ? b.reposts - a.reposts || b.likes - a.likes
              : b.likes - a.likes,
        ),
    [scopedPosts, category, query, sort],
  );
  const ranked = [...posts].sort((a, b) => b.likes - a.likes);

  function savePost(post: Post) {
    const alreadySaved = savedState.ids.includes(post.id);
    const removedIndex = filtered.findIndex((item) => item.id === post.id);
    const ids = alreadySaved
      ? savedState.ids.filter((id) => id !== post.id)
      : [...savedState.ids, post.id];
    let unavailable = false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      unavailable = true;
    }
    setSavedState({ ids, unavailable });
    setAnnouncement(
      `${alreadySaved ? "Removed" : "Saved"} ${post.name}'s post${unavailable ? " for this visit; browser storage is unavailable" : ""}.`,
    );
    if (view === "saved" && alreadySaved)
      requestAnimationFrame(() => {
        const buttons = document.querySelectorAll<HTMLButtonElement>(
          ".post-list .save-post",
        );
        const next = buttons[Math.min(removedIndex, buttons.length - 1)];
        if (next) next.focus();
        else
          document
            .querySelector<HTMLAnchorElement>(".empty-state .primary-button")
            ?.focus();
      });
  }
  async function copyPost(post: Post) {
    try {
      await navigator.clipboard.writeText(xSearchUrl(post));
      setAnnouncement(`Copied the X search link for ${post.name}'s post.`);
    } catch {
      setAnnouncement(
        "Copy is unavailable. Use “Find on X” beside the copy button to open the post search.",
      );
    }
  }
  function resetFilters() {
    setQuery("");
    setCategory("All posts");
    input.current?.focus();
  }
  function switchView(next: "feed" | "saved") {
    setView(next);
    setQuery("");
    setCategory("All posts");
    setAnnouncement("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function chooseTopic(next: Category) {
    setCategory(next);
    feedTitle.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }

  return (
    <>
      <a className="skip-link" href="#feed-title">
        Skip to tweets
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href="#feed"
            onClick={() => switchView("feed")}
            aria-label="Swarm Signal home"
          >
            <img src="./favicon.svg" width="34" height="34" alt="" />
            <span>
              swarm<span className="brand-light">signal</span>
              <span className="brand-dot">.</span>
            </span>
          </a>
          <nav className="main-nav" aria-label="Main navigation">
            <a
              href="#feed"
              className={`feed-nav ${view === "feed" ? "active" : ""}`}
              onClick={() => switchView("feed")}
              aria-current={view === "feed" ? "page" : undefined}
            >
              <Radio size={17} />
              The feed
            </a>
            <a
              href="#saved"
              className={view === "saved" ? "active" : ""}
              onClick={() => switchView("saved")}
              aria-current={view === "saved" ? "page" : undefined}
            >
              <Bookmark size={17} />
              Saved<span className="saved-count">{savedState.ids.length}</span>
            </a>
            <button className="about-nav" onClick={() => setAboutOpen(true)}>
              About
            </button>
          </nav>
          <a
            className="primary-button explore-button"
            href="https://imd.fun/"
            target="_blank"
            rel="noreferrer"
          >
            <span>Explore identity.md</span>
            <ArrowUpRight size={18} />
            <span className="sr-only">(opens a new tab)</span>
          </a>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              The swarm
              <br />
              is talking<span>.</span>
            </h1>
            <p>Top tweets about identity.md.</p>
          </div>
          <img
            className="hero-art"
            src="./images/pepe-operators.svg"
            width="580"
            height="300"
            alt="Two Pepe operators equipped with a circuit-powered AI blaster and a coding laptop."
          />
          <div className="hero-side-note" aria-hidden="true">
            <span className="signal-dot" />
            Pepes, armed with AI.
          </div>
        </section>

        <div className="content-layout">
          <section className="feed-section" aria-labelledby="feed-title">
            <div className="feed-heading">
              <div className="feed-title-wrap">
                <h2 id="feed-title" ref={feedTitle} tabIndex={-1}>
                  {view === "saved" ? "Saved tweets" : "Top tweets"}
                </h2>
                <span className="feed-count">{scopedPosts.length}</span>
              </div>
              <div className="sort-control">
                <ArrowDownWideNarrow size={16} />
                <label htmlFor="sort" className="sr-only">
                  Sort posts
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as Sort)}
                >
                  <option value="likes">Most liked</option>
                  <option value="newest">Newest in source</option>
                  <option value="reposts">Most reposted</option>
                </select>
              </div>
            </div>
            <div className="collection-meta">
              <span>
                {view === "saved"
                  ? "Kept in this browser"
                  : "October 19, 2026 snapshot"}
              </span>
              <button onClick={() => setAboutOpen(true)}>
                <Info size={14} />
                <span>How it works</span>
              </button>
            </div>
            <div className="feed-tools">
              <label htmlFor="search" className="search-label">
                Search the collection
              </label>
              <div className="search-field">
                <Search size={19} />
                <input
                  ref={input}
                  id="search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Posts, people, ideas…"
                  autoComplete="off"
                />
                {query && (
                  <button
                    className="icon-button"
                    onClick={() => {
                      setQuery("");
                      input.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
                <span className="search-hint" aria-hidden="true">
                  {posts.length} posts
                </span>
              </div>
              <div
                className="category-tabs"
                role="group"
                aria-label="Filter posts by topic"
              >
                {categories.map((item) => {
                  const Icon = categoryIcons[item];
                  return (
                    <button
                      key={item}
                      aria-pressed={category === item}
                      className={category === item ? "selected" : ""}
                      onClick={() => setCategory(item)}
                    >
                      <Icon size={16} />
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="results-note">
              <span role="status" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "post" : "posts"}
                {query || category !== "All posts"
                  ? " found"
                  : " in this collection"}
              </span>
              <span>Summaries · captured metrics</span>
            </div>
            {savedState.unavailable && (
              <p className="storage-note">
                <Info size={16} />
                Browser storage is unavailable. Saved posts will last for this
                visit.
              </p>
            )}
            <div className="action-status" role="status" aria-live="polite">
              {announcement}
            </div>
            <div className="post-list">
              {filtered.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  rank={ranked.findIndex((item) => item.id === post.id) + 1}
                  saved={savedState.ids.includes(post.id)}
                  onSave={() => savePost(post)}
                  onCopy={() => {
                    void copyPost(post);
                  }}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">
                  {view === "saved" && savedState.ids.length === 0 ? (
                    <Bookmark size={28} />
                  ) : (
                    <Search size={28} />
                  )}
                </span>
                <h3>
                  {view === "saved" && savedState.ids.length === 0
                    ? "A little signal for later"
                    : "No posts match this search"}
                </h3>
                <p>
                  {view === "saved" && savedState.ids.length === 0
                    ? "Use the bookmark on any post to keep it here, in this browser."
                    : `Try another search or clear your filters${query ? ` for “${query}”` : ""}.`}
                </p>
                {view === "saved" && savedState.ids.length === 0 ? (
                  <a
                    className="primary-button"
                    href="#feed"
                    onClick={() => switchView("feed")}
                  >
                    Explore the feed
                    <ArrowRight size={17} />
                  </a>
                ) : (
                  <button className="primary-button" onClick={resetFilters}>
                    Clear filters
                    <X size={17} />
                  </button>
                )}
              </div>
            )}
            {filtered.length > 0 && (
              <div className="feed-end">
                <CheckCheck size={21} />
                <p>You’re all caught up on this collection.</p>
                <a href={collectionSearch} target="_blank" rel="noreferrer">
                  Keep exploring on X <ArrowUpRight size={16} />
                </a>
              </div>
            )}
          </section>

          <aside
            className="sidebar"
            aria-label="About the swarm and collection topics"
          >
            <section className="about-swarm">
              <div className="swarm-mark" aria-hidden="true">
                <img src="./favicon.svg" width="40" height="40" alt="" />
                <span className="orbit orbit-one" />
                <span className="orbit orbit-two" />
                <span className="orbit-dot dot-one" />
                <span className="orbit-dot dot-two" />
                <Sparkles size={20} className="orbit-spark" />
              </div>
              <h2>
                Small frogs.
                <br />
                Big compute.
              </h2>
              <p>
                Identity.md is a network of AI agents that build, review and
                deliver work.
              </p>
              <a href="https://imd.fun/" target="_blank" rel="noreferrer">
                Meet identity.md
                <ArrowUpRight size={17} />
              </a>
            </section>
            <section className="topics-section">
              <h2>Explore the conversation</h2>
              <div className="topic-list">
                {(["Building", "Ideas", "Community"] as Category[]).map(
                  (item) => {
                    const Icon = categoryIcons[item];
                    const count = scopedPosts.filter(
                      (post) => post.category === item,
                    ).length;
                    return (
                      <button key={item} onClick={() => chooseTopic(item)}>
                        <span className="topic-icon">
                          <Icon size={18} />
                        </span>
                        <span>
                          <strong>{item}</strong>
                          <span>
                            {item === "Building"
                              ? "What the swarm is shipping"
                              : item === "Ideas"
                                ? "Where it could go next"
                                : "The people behind the agents"}
                          </span>
                        </span>
                        <span className="topic-count">{count}</span>
                        <ArrowRight size={15} />
                      </button>
                    );
                  },
                )}
              </div>
            </section>
            <section className="collection-card">
              <div className="collection-title">
                <Info size={18} />
                <h2>A snapshot of the swarm</h2>
              </div>
              <p>
                A selected collection, ranked by captured likes. Source
                summaries and counts may be delayed.
              </p>
              <button
                className="text-button"
                onClick={() => setAboutOpen(true)}
              >
                About the sources
                <ArrowRight size={16} />
              </button>
              <div className="snapshot-date">
                <span className="signal-dot" />
                <span>Collected {CAPTURE_DATE}</span>
              </div>
            </section>
            <div className="sidebar-footer">
              <span>Independent. Community-minded.</span>
              <span>Not affiliated with X or identity.md.</span>
              <a href={collectionSearch} target="_blank" rel="noreferrer">
                Search the wider conversation
                <ArrowUpRight size={14} />
              </a>
            </div>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <a
          href="#feed"
          onClick={() => switchView("feed")}
          className="footer-brand"
        >
          swarm signal<span>.</span>
        </a>
        <span>A small window into the swarm.</span>
        <button onClick={() => setAboutOpen(true)}>
          Sources &amp; collection notes
          <ArrowUpRight size={15} />
        </button>
      </footer>
      <CollectionDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
