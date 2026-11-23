export interface VideoLink {
  label: string;
  url: string;
  provider: string;
}

export interface PostStats {
  views: number;
  likes: number;
  comments: number;
  photoCount: number;
  videoCount: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  tags: string[];
  uploader: string;
  uploadDate: string;
  thumbnailUrl: string;
  images: string[];
  videoLinks: VideoLink[];
  stats: PostStats;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  postCount: number;
}
