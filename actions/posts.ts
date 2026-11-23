"use server";

import { getPaginatedPosts, getTrendingPosts, getMostViewedPosts } from "@/lib/data";

export async function getLatestPostsAction(page = 1, pageSize = 12) {
  return await getPaginatedPosts(page, pageSize);
}

export async function getTrendingPostsAction(limit = 10) {
  return await getTrendingPosts(limit);
}

export async function getMostViewedPostsAction(limit = 10) {
  return await getMostViewedPosts(limit);
}
