import ContentGrid from "./ContentGrid";
import type { Post } from "@/types/post";

export default function PostGrid({ posts }: { posts?: Post[] }) {
  return <ContentGrid posts={posts} />;
}
