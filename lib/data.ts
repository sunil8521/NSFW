import type { Post, Category } from "@/types/post";
import categoriesData from "@/data/categories.json";
import { dbService } from "@/lib/db";

const categories: Category[] = categoriesData as Category[];

export async function getAllPosts(): Promise<Post[]> {
  return dbService.getAllPosts();
}

export async function getTrendingPosts(limit = 10): Promise<Post[]> {
  return dbService.getTrendingPosts(limit);
}

export async function getMostViewedPosts(limit = 10): Promise<Post[]> {
  return dbService.getMostViewedPosts(limit);
}

export async function getPaginatedPosts(
  page = 1,
  pageSize = 12
): Promise<{
  posts: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  return dbService.getPaginatedPosts(page, pageSize);
}

export async function getPostById(id: string): Promise<Post | null> {
  return dbService.getPostById(id);
}

export async function getPostsByCategory(slug: string): Promise<Post[]> {
  return dbService.getPostsByCategory(slug);
}

export async function getPaginatedPostsByCategory(
  slug: string,
  page = 1,
  pageSize = 12
) {
  return dbService.getPaginatedPostsByCategory(slug, page, pageSize);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  return dbService.getPostsByTag(tag);
}

export async function getPaginatedPostsByTag(
  tag: string,
  page = 1,
  pageSize = 12
) {
  return dbService.getPaginatedPostsByTag(tag, page, pageSize);
}

export async function searchPosts(query: string): Promise<Post[]> {
  return dbService.searchPosts(query);
}

export async function getPaginatedSearchPosts(
  query: string,
  page = 1,
  pageSize = 12
) {
  return dbService.getPaginatedSearchPosts(query, page, pageSize);
}

export async function getRelatedPosts(post: Post, limit = 6): Promise<Post[]> {
  return dbService.getRelatedPosts(post, limit);
}

export function getAllCategories(): Category[] {
  return categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
