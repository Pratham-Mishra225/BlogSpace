/**
 * BlogSpace API service layer.
 *
 * All mock data has been replaced with real HTTP calls to the Express backend.
 * Every exported function preserves its original signature so that all consumers
 * (hooks, store, components) need no signature changes.
 *
 * Backend base URL: VITE_API_URL (defaults to http://localhost:5000/api via api-client.ts)
 */

import { apiClient } from "@/lib/api-client";
import type {
  AuthDTO,
  CreatePostDTO,
  Post,
  Profile,
  ProfileSetupDTO,
  UpdatePostDTO,
  User,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Maps a raw backend post object to the frontend Post shape. */
const mapPost = (raw: Record<string, unknown>): Post => ({
  id: (raw._id ?? raw.id) as string,
  title: raw.title as string,
  content: raw.content as string,
  format: "html", // backend always stores TipTap HTML
  // coverImage may be an object {url, publicId} from Cloudinary or a plain string.
  coverImage:
    typeof raw.coverImage === "object" && raw.coverImage !== null
      ? ((raw.coverImage as { url: string }).url ?? "")
      : (raw.coverImage as string) ?? "",
  author: mapUser(raw.author as Record<string, unknown>),
  tags: (raw.tags as string[]) ?? [],
  createdAt: raw.createdAt as string,
  updatedAt: (raw.updatedAt ?? raw.createdAt) as string,
  readingTime: (raw.readingTime as number) ?? 1,
  likeCount: (raw.likeCount as number) ?? 0,
  isLiked: (raw.isLiked as boolean) ?? false,
  status: (raw.status as "published" | "draft") ?? "published",
});

/** Maps a raw backend user / author object to the frontend User shape. */
const mapUser = (raw: Record<string, unknown>): User => ({
  id: (raw._id ?? raw.id) as string,
  name: raw.name as string,
  username: raw.username as string,
  avatar: (raw.avatar as string) ?? "",
  bio: (raw.bio as string) ?? "",
  isProfileComplete: !!(raw.username),
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const login = async (data: AuthDTO): Promise<User & { token: string }> => {
  const res = await apiClient.post<{ success: boolean; data: Record<string, unknown> }>(
    "/auth/login",
    data
  );
  const payload = res.data.data;
  return {
    ...mapUser(payload.user as Record<string, unknown>),
    token: payload.accessToken as string,
  };
};

export const signup = async (data: AuthDTO): Promise<User & { token: string }> => {
  const res = await apiClient.post<{ success: boolean; data: Record<string, unknown> }>(
    "/auth/signup",
    {
      email: data.email,
      password: data.password,
      // The backend requires name; derive a sensible default from the email.
      name: data.email.split("@")[0] ?? "New Writer",
      username: `user_${Date.now()}`, // temporary; user will update on onboarding
    }
  );
  const payload = res.data.data;
  return {
    ...mapUser(payload.user as Record<string, unknown>),
    token: payload.accessToken as string,
  };
};

export const logout = async (): Promise<void> => {
  // No backend logout endpoint yet — token is simply removed from the store.
};

export const getMe = async (): Promise<User> => {
  const res = await apiClient.get<{ success: boolean; data: { user: Record<string, unknown> } }>(
    "/auth/me"
  );
  return mapUser(res.data.data.user);
};

// ─────────────────────────────────────────────────────────────────────────────
// POSTS
// ─────────────────────────────────────────────────────────────────────────────

export const getPosts = async (): Promise<Post[]> => {
  const res = await apiClient.get<{
    success: boolean;
    data: { posts: Record<string, unknown>[] };
  }>("/posts", { params: { limit: 50 } });
  return res.data.data.posts.map(mapPost);
};

export const getFollowingPosts = async (): Promise<Post[]> => {
  // The backend does not yet have a dedicated "following" feed endpoint.
  // For now we fall back to the main feed; this will be wired up in Phase 2.
  return getPosts();
};

export const getPostById = async (id: string): Promise<Post> => {
  const res = await apiClient.get<{ success: boolean; data: Record<string, unknown> }>(
    `/posts/${id}`
  );
  return mapPost(res.data.data);
};

export const getDraftPosts = async (): Promise<Post[]> => {
  const res = await apiClient.get<{
    success: boolean;
    data: { drafts: Record<string, unknown>[] };
  }>("/drafts");
  // Map Draft documents (which have the same shape as posts minus status)
  return res.data.data.drafts.map((d) =>
    mapPost({ ...d, status: "draft" })
  );
};

export const createPost = async (data: CreatePostDTO): Promise<Post> => {
  const res = await apiClient.post<{ success: boolean; data: Record<string, unknown> }>(
    "/posts",
    {
      title: data.title,
      content: data.content,
      excerpt: data.content.replace(/<[^>]+>/g, " ").trim().slice(0, 280),
      coverImage: data.coverImage ? { url: data.coverImage, publicId: "" } : undefined,
      tags: data.tags,
    }
  );
  return mapPost(res.data.data);
};

export const saveDraft = async (data: CreatePostDTO): Promise<Post> => {
  const res = await apiClient.post<{ success: boolean; data: Record<string, unknown> }>(
    "/drafts",
    {
      title: data.title || "Untitled draft",
      content: data.content,
      excerpt: data.content.replace(/<[^>]+>/g, " ").trim().slice(0, 280),
      coverImage: data.coverImage ? { url: data.coverImage, publicId: "" } : undefined,
      tags: data.tags,
    }
  );
  return mapPost({ ...res.data.data, status: "draft" });
};

export const updatePost = async (data: UpdatePostDTO): Promise<Post> => {
  const res = await apiClient.patch<{ success: boolean; data: Record<string, unknown> }>(
    `/posts/${data.id}`,
    {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.coverImage !== undefined && {
        coverImage: { url: data.coverImage, publicId: "" },
      }),
      ...(data.tags !== undefined && { tags: data.tags }),
    }
  );
  return mapPost(res.data.data);
};

export const deletePost = async (id: string): Promise<{ id: string }> => {
  // Try posts first; if it's a draft, try the drafts endpoint.
  try {
    await apiClient.delete(`/posts/${id}`);
    return { id };
  } catch {
    await apiClient.delete(`/drafts/${id}`);
    return { id };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LIKES
// ─────────────────────────────────────────────────────────────────────────────

export const likePost = async (
  postId: string
): Promise<{ likeCount: number; isLiked: true }> => {
  const res = await apiClient.post<{
    success: boolean;
    data: { likeCount: number; isLiked: true };
  }>(`/posts/${postId}/like`);
  return res.data.data;
};

export const unlikePost = async (
  postId: string
): Promise<{ likeCount: number; isLiked: false }> => {
  const res = await apiClient.delete<{
    success: boolean;
    data: { likeCount: number; isLiked: false };
  }>(`/posts/${postId}/like`);
  return res.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOWS
// ─────────────────────────────────────────────────────────────────────────────

export const followUser = async (userId: string): Promise<{ following: true }> => {
  const res = await apiClient.post<{ success: boolean; data: { following: true } }>(
    `/users/${userId}/follow`
  );
  return res.data.data;
};

export const unfollowUser = async (userId: string): Promise<{ following: false }> => {
  const res = await apiClient.delete<{ success: boolean; data: { following: false } }>(
    `/users/${userId}/follow`
  );
  return res.data.data;
};

/**
 * toggleFollow is used by FollowButton.
 * The follow status is derived from the Profile response's `isFollowing` flag;
 * we determine which action to take based on the optimistic local state.
 */
export const toggleFollow = async (
  userId: string,
  currentlyFollowing: boolean
): Promise<{ following: boolean }> => {
  return currentlyFollowing ? unfollowUser(userId) : followUser(userId);
};

/**
 * isFollowing — synchronous check retained for backward compatibility.
 * Since follow state is now server-driven, this always returns false
 * and the real value comes from the Profile API response's `isFollowing` field.
 * @deprecated Prefer the `isFollowing` field returned by `getProfile`.
 */
export const isFollowing = (_userId: string): boolean => false;

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export const getProfile = async (username: string): Promise<Profile> => {
  const res = await apiClient.get<{
    success: boolean;
    data: {
      user: Record<string, unknown>;
      posts: Record<string, unknown>[];
      isFollowing: boolean;
    };
  }>(`/users/${username}`);

  const { user, posts, isFollowing: isFollowingResult } = res.data.data;
  const mappedUser = mapUser(user);

  return {
    user: mappedUser,
    followersCount: (user.followersCount as number) ?? 0,
    followingCount: (user.followingCount as number) ?? 0,
    posts: posts.map(mapPost),
    isFollowing: isFollowingResult,
  };
};

export const checkUsernameAvailability = async (
  username: string
): Promise<{ available: boolean }> => {
  try {
    // Try fetching the profile; if 404 → username is available.
    await apiClient.get(`/users/${username}`);
    return { available: false };
  } catch (err) {
    if (err instanceof Error && err.message === "User not found") {
      return { available: true };
    }
    // Any other error (network etc.) — optimistically treat as unavailable.
    return { available: false };
  }
};

export const createProfile = (data: ProfileSetupDTO): Promise<User> => updateProfile(data);

export const updateProfile = async (data: ProfileSetupDTO): Promise<User> => {
  const res = await apiClient.patch<{ success: boolean; data: { user: Record<string, unknown> } }>(
    "/users/me",
    {
      name: data.fullName.trim(),
      username: data.username.trim().toLowerCase(),
      bio: data.bio.trim(),
      ...(data.avatar.trim() && { avatar: data.avatar.trim() }),
    }
  );
  return mapUser(res.data.data.user);
};

export const getUsers = async (): Promise<User[]> => [];

// ─────────────────────────────────────────────────────────────────────────────
// UPLOADS
// ─────────────────────────────────────────────────────────────────────────────

export const uploadImage = async (file: File): Promise<{ url: string; publicId: string }> => {
  const form = new FormData();
  form.append("image", file);
  const res = await apiClient.post<{
    success: boolean;
    data: { url: string; publicId: string };
  }>("/uploads/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy mock compat shim (no-op; was used internally by the mock only)
// ─────────────────────────────────────────────────────────────────────────────
export const _setCurrentUserId = (_id: string | null): void => {
  // No-op — current user is now tracked server-side via JWT.
};
