import type {
  AuthDTO,
  CreatePostDTO,
  Post,
  Profile,
  ProfileSetupDTO,
  UpdatePostDTO,
  User,
} from "@/types";

const DELAY = 600;
const ERROR_RATE = 0;

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < ERROR_RATE) {
        reject(new Error("Network error. Please try again."));
        return;
      }
      resolve(value);
    }, DELAY);
  });

const computeReadingTime = (content: string): number => {
  const text = content.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

// ---- seeded users ----
const users: User[] = [
  {
    id: "u1",
    name: "Eleanor Hart",
    username: "eleanor",
    avatar: "https://i.pravatar.cc/200?img=47",
    bio: "Essayist on slow living and the craft of attention.",
    isProfileComplete: true,
  },
  {
    id: "u2",
    name: "Marcus Lin",
    username: "marcus",
    avatar: "https://i.pravatar.cc/200?img=12",
    bio: "Writes about software, systems, and the people who make them.",
    isProfileComplete: true,
  },
  {
    id: "u3",
    name: "Ana Beltrán",
    username: "ana",
    avatar: "https://i.pravatar.cc/200?img=32",
    bio: "Photographer and field-notes diarist. Currently in Lisbon.",
    isProfileComplete: true,
  },
  {
    id: "u4",
    name: "Theo Whitfield",
    username: "theo",
    avatar: "https://i.pravatar.cc/200?img=68",
    bio: "Reader-in-residence. Long sentences welcome.",
    isProfileComplete: true,
  },
];

const sampleContent = (intro: string) => `${intro}

## A quiet beginning

There is a moment, just before the morning rush, when the world feels rehearsed.
Coffee steams. The street outside is half-light. You sit down, open a blank
page, and the day has not yet decided what it wants to be.

> "We write to taste life twice, in the moment and in retrospect." — Anaïs Nin

## On craft

Good writing rewards patience. Consider the rhythm of a paragraph the way a
musician considers a phrase — where to breathe, where to push, where to let the
silence do the work.

- Read your draft aloud
- Cut the first sentence; it was a warm-up
- Trust the reader

## Closing

Stories worth your time are rarely written quickly. Come back tomorrow. The
page will still be here.`;

// ---- seeded posts ----
const posts: Post[] = [
  {
    id: "p1",
    title: "The Quiet Discipline of Showing Up",
    content: sampleContent("We tend to romanticize inspiration. The truth is duller and more demanding: the work shows up because *you* did."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    author: users[0],
    tags: ["writing", "craft", "habits"],
    createdAt: "2026-04-22T09:00:00.000Z",
    readingTime: 6,
    likeCount: 124,
    isLiked: false,
    status: "published",
    updatedAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "p2",
    title: "Notes on Building Software That Lasts",
    content: sampleContent("Software ages like architecture: gracefully if the bones are good, miserably if they are not."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
    author: users[1],
    tags: ["engineering", "systems"],
    createdAt: "2026-04-19T14:30:00.000Z",
    readingTime: 9,
    likeCount: 88,
    isLiked: false,
    status: "published",
    updatedAt: "2026-04-19T14:30:00.000Z",
  },
  {
    id: "p3",
    title: "Lisbon, in Three Afternoons",
    content: sampleContent("The light here does most of the storytelling. You only have to stand still long enough to listen."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80",
    author: users[2],
    tags: ["travel", "photography"],
    createdAt: "2026-04-15T08:10:00.000Z",
    readingTime: 5,
    likeCount: 212,
    isLiked: false,
    status: "published",
    updatedAt: "2026-04-15T08:10:00.000Z",
  },
  {
    id: "p4",
    title: "Why I Reread the Same Five Books",
    content: sampleContent("There is no shortage of new books. There is, however, a shortage of attention — and that is the variable worth optimizing."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80",
    author: users[3],
    tags: ["reading", "essays"],
    createdAt: "2026-04-10T18:00:00.000Z",
    readingTime: 7,
    likeCount: 47,
    isLiked: false,
    status: "published",
    updatedAt: "2026-04-10T18:00:00.000Z",
  },
  {
    id: "p5",
    title: "A Field Guide to Slow Mornings",
    content: sampleContent("Mornings, kept slow on purpose, become the editor of the rest of the day."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80",
    author: users[0],
    tags: ["lifestyle", "habits"],
    createdAt: "2026-04-05T07:45:00.000Z",
    readingTime: 4,
    likeCount: 63,
    isLiked: false,
    status: "published",
    updatedAt: "2026-04-05T07:45:00.000Z",
  },
  {
    id: "p6",
    title: "Designing for the Reader, Not the Algorithm",
    content: sampleContent("If you write for the feed, the feed owns your voice. Write for one person, slowly, and the rest will find you."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
    author: users[1],
    tags: ["design", "writing"],
    createdAt: "2026-03-28T11:20:00.000Z",
    readingTime: 6,
    likeCount: 154,
    isLiked: false,
    status: "published",
    updatedAt: "2026-03-28T11:20:00.000Z",
  },
  {
    id: "p7",
    title: "The Camera as a Reason to Stay",
    content: sampleContent("A camera, used patiently, is an excuse to stand somewhere a little longer than is comfortable."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80",
    author: users[2],
    tags: ["photography", "travel"],
    createdAt: "2026-03-22T16:00:00.000Z",
    readingTime: 5,
    likeCount: 91,
    isLiked: false,
    status: "published",
    updatedAt: "2026-03-22T16:00:00.000Z",
  },
  {
    id: "p8",
    title: "Marginalia: The Art of Talking Back to Books",
    content: sampleContent("A pencil in the margin is the cheapest, oldest, and most underrated reading tool ever invented."),
    format: "markdown",
    coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80",
    author: users[3],
    tags: ["reading", "essays"],
    createdAt: "2026-03-14T09:00:00.000Z",
    readingTime: 8,
    likeCount: 38,
    isLiked: false,
    status: "published",
    updatedAt: "2026-03-14T09:00:00.000Z",
  },
];

interface FollowEdge {
  followerId: string;
  followingId: string;
}
const follows: FollowEdge[] = [];
const likes = new Set<string>(); // key: `${userId}:${postId}`

let currentUserId: string | null = null;
export const _setCurrentUserId = (id: string | null) => {
  currentUserId = id;
};

const decoratePost = (p: Post): Post => ({
  ...p,
  isLiked: currentUserId ? likes.has(`${currentUserId}:${p.id}`) : false,
});

// ---- POSTS ----
export const getPosts = (): Promise<Post[]> =>
  delay(
    [...posts]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map(decoratePost),
  );

export const getFollowingPosts = (): Promise<Post[]> => {
  if (!currentUserId) return delay([]);
  const followingIds = follows
    .filter((f) => f.followerId === currentUserId)
    .map((f) => f.followingId);
  return delay(
    posts
      .filter((p) => followingIds.includes(p.author.id))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map(decoratePost),
  );
};

export const getPostById = (id: string): Promise<Post> => {
  const post = posts.find((p) => p.id === id);
  if (!post) return Promise.reject(new Error("Post not found"));
  return delay(decoratePost(post));
};

export const createPost = (data: CreatePostDTO): Promise<Post> => {
  const author = users.find((u) => u.id === currentUserId) ?? users[0];
  const newPost: Post = {
    id: `p${Date.now()}`,
    title: data.title.trim() || "Untitled",
    content: data.content,
    format: data.format ?? "html",
    coverImage:
      data.coverImage?.trim() ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
    author,
    tags: data.tags.filter(Boolean),
    createdAt: new Date().toISOString(),
    readingTime: computeReadingTime(data.content),
    likeCount: 0,
    isLiked: false,
  };
  posts.unshift(newPost);
  return delay(newPost);
};

export const updatePost = (data: UpdatePostDTO): Promise<Post> => {
  const idx = posts.findIndex((p) => p.id === data.id);
  if (idx < 0) return Promise.reject(new Error("Post not found"));
  const next: Post = {
    ...posts[idx],
    ...(data.title !== undefined && { title: data.title }),
    ...(data.content !== undefined && {
      content: data.content,
      readingTime: computeReadingTime(data.content),
    }),
    ...(data.format !== undefined && { format: data.format }),
    ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
    ...(data.tags !== undefined && { tags: data.tags }),
  };
  posts[idx] = next;
  return delay(decoratePost(next));
};

export const deletePost = (id: string): Promise<{ id: string }> => {
  const idx = posts.findIndex((p) => p.id === id);
  if (idx < 0) return Promise.reject(new Error("Post not found"));
  posts.splice(idx, 1);
  return delay({ id });
};

// ---- LIKES ----
export const likePost = (postId: string): Promise<{ likeCount: number; isLiked: true }> => {
  if (!currentUserId) return Promise.reject(new Error("Not authenticated"));
  const post = posts.find((p) => p.id === postId);
  if (!post) return Promise.reject(new Error("Post not found"));
  const key = `${currentUserId}:${postId}`;
  if (!likes.has(key)) {
    likes.add(key);
    post.likeCount += 1;
  }
  return delay({ likeCount: post.likeCount, isLiked: true });
};

export const unlikePost = (postId: string): Promise<{ likeCount: number; isLiked: false }> => {
  if (!currentUserId) return Promise.reject(new Error("Not authenticated"));
  const post = posts.find((p) => p.id === postId);
  if (!post) return Promise.reject(new Error("Post not found"));
  const key = `${currentUserId}:${postId}`;
  if (likes.has(key)) {
    likes.delete(key);
    post.likeCount = Math.max(0, post.likeCount - 1);
  }
  return delay({ likeCount: post.likeCount, isLiked: false });
};

// ---- SOCIAL ----
export const followUser = (userId: string): Promise<{ following: true }> => {
  if (!currentUserId) return Promise.reject(new Error("Not authenticated"));
  if (!follows.some((f) => f.followerId === currentUserId && f.followingId === userId)) {
    follows.push({ followerId: currentUserId, followingId: userId });
  }
  return delay({ following: true });
};

export const unfollowUser = (userId: string): Promise<{ following: false }> => {
  if (!currentUserId) return Promise.reject(new Error("Not authenticated"));
  const idx = follows.findIndex(
    (f) => f.followerId === currentUserId && f.followingId === userId,
  );
  if (idx >= 0) follows.splice(idx, 1);
  return delay({ following: false });
};

export const toggleFollow = async (userId: string): Promise<{ following: boolean }> => {
  if (!currentUserId) return Promise.reject(new Error("Not authenticated"));
  const already = follows.some(
    (f) => f.followerId === currentUserId && f.followingId === userId,
  );
  return already ? unfollowUser(userId) : followUser(userId);
};

export const isFollowing = (userId: string): boolean => {
  if (!currentUserId) return false;
  return follows.some(
    (f) => f.followerId === currentUserId && f.followingId === userId,
  );
};

// ---- PROFILE ----
export const getProfile = (id: string): Promise<Profile> => {
  const user = users.find((u) => u.id === id);
  if (!user) return Promise.reject(new Error("User not found"));
  const userPosts = posts
    .filter((p) => p.author.id === id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map(decoratePost);
  const followersCount = follows.filter((f) => f.followingId === id).length;
  const followingCount = follows.filter((f) => f.followerId === id).length;
  return delay({ user, followersCount, followingCount, posts: userPosts });
};

export const checkUsernameAvailability = (
  username: string,
): Promise<{ available: boolean }> => {
  const taken = users.some(
    (u) => u.username?.toLowerCase() === username.toLowerCase() && u.id !== currentUserId,
  );
  return delay({ available: !taken && username.length >= 3 });
};

export const createProfile = (data: ProfileSetupDTO): Promise<User> =>
  updateProfile(data);

export const updateProfile = (data: ProfileSetupDTO): Promise<User> => {
  if (!currentUserId) return Promise.reject(new Error("Not authenticated"));
  const idx = users.findIndex((u) => u.id === currentUserId);
  if (idx < 0) return Promise.reject(new Error("User not found"));
  const updated: User = {
    ...users[idx],
    name: data.fullName.trim(),
    username: data.username.trim().toLowerCase(),
    bio: data.bio.trim(),
    avatar: data.avatar.trim() || users[idx].avatar,
    isProfileComplete: true,
  };
  users[idx] = updated;
  // Also reflect on existing posts authored by user
  posts.forEach((p) => {
    if (p.author.id === updated.id) p.author = updated;
  });
  return delay(updated);
};

export const getUsers = (): Promise<User[]> => delay([...users]);

// ---- AUTH ----
export const login = (data: AuthDTO): Promise<User> => {
  void data;
  return delay(users[0]);
};

export const signup = (data: AuthDTO): Promise<User> => {
  const newUser: User = {
    id: `u${Date.now()}`,
    name: data.email.split("@")[0] || "New Writer",
    avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(data.email)}`,
    bio: "",
    isProfileComplete: false,
  };
  users.push(newUser);
  return delay(newUser);
};

export const logout = (): Promise<void> => delay(undefined);
