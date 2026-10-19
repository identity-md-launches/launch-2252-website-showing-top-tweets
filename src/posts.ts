export type Category = "Building" | "Ideas" | "Community";
export type Post = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  color: string;
  category: Category;
  summary: string;
  searchPhrase: string;
  likes: number;
  replies: number;
  reposts: number;
  ageDays: number;
  source: string;
};

export const CAPTURE_DATE = "October 19, 2026";
export const posts: Post[] = [
  {
    id: "contract-jobs",
    name: "Adam",
    handle: "surfcoderepeat",
    initials: "a",
    color: "sand",
    category: "Building",
    summary:
      "Smart contracts can now request swarm jobs beyond oracle tasks: websites, images, hooks and research, with the result returned through a callback.",
    searchPhrase: "you can now initiate any swarm jobs from smart contracts",
    likes: 199,
    replies: 23,
    reposts: 33,
    ageDays: 4,
    source: "https://www.sotwe.com/imdradar",
  },
  {
    id: "launch-form",
    name: "taylor",
    handle: "taylor_",
    initials: "t",
    color: "lavender",
    category: "Building",
    summary:
      "A new launch form turns an idea into a job for the IMD agent swarm, from a website or audit to a token or Uniswap hook.",
    searchPhrase: "just shipped a new launch form",
    likes: 189,
    replies: 20,
    reposts: 30,
    ageDays: 4,
    source: "https://www.sotwe.com/imdradar",
  },
  {
    id: "new-node",
    name: "Jose",
    handle: "The0xJose",
    initials: "j",
    color: "blue",
    category: "Community",
    summary:
      "Jose shares plans to run an IMD node and explore how Orbio could contribute to the ecosystem.",
    searchPhrase: "Bought an imd nft and will be running a node",
    likes: 160,
    replies: 33,
    reposts: 20,
    ageDays: 6,
    source: "https://www.sotwe.com/imdradar",
  },
  {
    id: "what-is-a-swarm",
    name: "Prem Makeig",
    handle: "nxt3d",
    initials: "pm",
    color: "rose",
    category: "Ideas",
    summary:
      "Agent NFTs, coding agents and a native token: Prem explores why “swarm” fits IdentityMD, and imagines communities building open-source software around a shared mission.",
    searchPhrase:
      "I think IdentityMD may well be considered one of the first projects",
    likes: 101,
    replies: 6,
    reposts: 17,
    ageDays: 1,
    source: "https://www.sotwe.com/nxt3d",
  },
  {
    id: "collections",
    name: "Adam",
    handle: "surfcoderepeat",
    initials: "a",
    color: "sand",
    category: "Building",
    summary:
      "Swarm-built NFT collections are now browsable, including experiments with release mechanisms, onchain art and Uniswap v4 hooks.",
    searchPhrase:
      "You can now browse all nft collections deployed by the swarm",
    likes: 88,
    replies: 7,
    reposts: 13,
    ageDays: 2,
    source: "https://www.sotwe.com/imdradar",
  },
  {
    id: "radar-art",
    name: "IMD Radar",
    handle: "imdradar",
    initials: "ir",
    color: "green",
    category: "Building",
    summary:
      "IMD Radar adds a collections page for onchain artwork across the ecosystem, with individual pieces available to inspect.",
    searchPhrase: "the art is the code IMD Radar",
    likes: 50,
    replies: 6,
    reposts: 7,
    ageDays: 2,
    source: "https://www.sotwe.com/imdradar",
  },
  {
    id: "learning-to-build",
    name: "Gothsa",
    handle: "nftgothsa",
    initials: "g",
    color: "mint",
    category: "Community",
    summary:
      "Gothsa reflects on three weeks learning to run an IdentityMD agent, from a first server setup to contributing alongside the community. Their results describe one personal experience.",
    searchPhrase: "21 Days with IdentityMD",
    likes: 35,
    replies: 4,
    reposts: 2,
    ageDays: 2,
    source: "https://www.sotwe.com/nxt3d",
  },
  {
    id: "permissionless-work",
    name: "Prem Makeig",
    handle: "nxt3d",
    initials: "pm",
    color: "rose",
    category: "Ideas",
    summary:
      "Prem sees permissionless capital and coordination enabling real work, and considers how agent swarms could take on larger challenges.",
    searchPhrase:
      "Everyone has been looking for a use case for blockchains other than speculation",
    likes: 19,
    replies: 1,
    reposts: 1,
    ageDays: 3,
    source: "https://www.sotwe.com/imdradar",
  },
];
export const xSearchUrl = (post: Post) =>
  `https://x.com/search?q=${encodeURIComponent(`from:${post.handle} ${post.searchPhrase}`)}&src=typed_query&f=top`;
export const collectionSearch =
  "https://x.com/search?q=identity.md%20OR%20%22identity%20MD%22%20OR%20%24IMD&src=typed_query&f=top";
