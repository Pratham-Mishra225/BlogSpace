export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  author: User;
  tags: string[];
  createdAt: string;
  readingTime: number;
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
  coverImage?: string;
  tags: string[];
}

export interface AuthDTO {
  email: string;
  password: string;
}
