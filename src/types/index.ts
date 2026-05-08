export type ContentFormat = "html" | "markdown";
export type PostStatus = "draft" | "published";

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  username?: string;
  isProfileComplete?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  format: ContentFormat;
  coverImage: string;
  author: User;
  tags: string[];
  createdAt: string;
  readingTime: number;
  likeCount: number;
  isLiked: boolean;
}

export interface Profile {
  user: User;
  followersCount: number;
  followingCount: number;
  posts: Post[];
}

export interface CreatePostDTO {
  title: string;
  content: string;
  format?: ContentFormat;
  coverImage?: string;
  tags: string[];
}

export interface UpdatePostDTO extends Partial<CreatePostDTO> {
  id: string;
}

export interface AuthDTO {
  email: string;
  password: string;
}

export interface ProfileSetupDTO {
  fullName: string;
  username: string;
  bio: string;
  avatar: string;
}
