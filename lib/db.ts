import { mongoDb } from "./mongodb";
import type { Post } from "@/types/post";

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  content: string;
  createdAt: string;
}

export interface SavedPostItem {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface LikeItem {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface UploadedVideoItem {
  id: string;
  title: string;
  originalName: string;
  size?: number;
  streamtape: {
    fileId: string;
    watchUrl: string;
    embedUrl: string;
  };
  vidara: {
    filecode: string;
    watchUrl: string;
    embedUrl: string;
  };
  createdAt: string;
}

export interface UploadedImageItem {
  id: string;
  title: string;
  originalName: string;
  size?: number;
  mimeType?: string;
  code: string;
  pageUrl: string;
  directUrl: string;
  thumbnailUrl: string;
  alternateUrls?: Record<string, string>;
  createdAt: string;
}

let initialized = false;
async function ensureInit() {
  if (initialized) return;
  try {
    // Indexes
    await Promise.all([
      mongoDb.collection("comments").createIndex({ postId: 1, createdAt: -1 }),
      mongoDb.collection("saved_posts").createIndex({ userId: 1, postId: 1 }, { unique: true }),
      mongoDb.collection("likes").createIndex({ userId: 1, postId: 1 }, { unique: true }),
      mongoDb.collection("posts").createIndex({ id: 1 }, { unique: true }),
      mongoDb.collection("posts").createIndex({ category: 1 }),
      mongoDb.collection("posts").createIndex({ tags: 1 }),
      mongoDb.collection("posts").createIndex({ "stats.views": -1 }),
      mongoDb.collection("posts").createIndex({ "stats.likes": -1 }),
      mongoDb.collection("posts").createIndex({ uploadDate: -1 }),
      mongoDb.collection("uploaded_videos").createIndex({ createdAt: -1 }),
      mongoDb.collection("uploaded_images").createIndex({ createdAt: -1 }),
    ]);

    initialized = true;
  } catch (err) {
    // Indexes might already exist
    initialized = true;
  }
}

export const dbService = {
  // ─── POSTS QUERIES ─────────────────────────────────
  async getAllPosts(): Promise<Post[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("posts")
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  async getPaginatedPosts(
    page = 1,
    pageSize = 12
  ): Promise<{
    posts: Post[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    await ensureInit();
    const total = await mongoDb.collection("posts").countDocuments();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.max(1, Math.min(page, totalPages));
    const skip = (validPage - 1) * pageSize;

    const docs = await mongoDb
      .collection("posts")
      .find({})
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      posts: docs.map(({ _id, ...rest }: any) => rest as Post),
      total,
      totalPages,
      currentPage: validPage,
    };
  },

  async getTrendingPosts(limit = 10): Promise<Post[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("posts")
      .find({})
      .sort({ "stats.likes": -1, uploadDate: -1 })
      .limit(limit)
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  async getMostViewedPosts(limit = 10): Promise<Post[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("posts")
      .find({})
      .sort({ "stats.views": -1, uploadDate: -1 })
      .limit(limit)
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  async getPostById(id: string): Promise<Post | null> {
    await ensureInit();
    const doc = await mongoDb.collection("posts").findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc as any;
    return rest as Post;
  },

  async getPostsByCategory(categorySlug: string): Promise<Post[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("posts")
      .find({ category: categorySlug })
      .sort({ uploadDate: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  async getPaginatedPostsByCategory(
    categorySlug: string,
    page = 1,
    pageSize = 12
  ): Promise<{
    posts: Post[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    await ensureInit();
    const isTrending = categorySlug === "trending";
    const query = isTrending ? {} : { category: categorySlug };
    const sort: any = isTrending
      ? { "stats.likes": -1, uploadDate: -1 }
      : { uploadDate: -1 };

    const total = await mongoDb.collection("posts").countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.max(1, Math.min(page, totalPages));
    const skip = (validPage - 1) * pageSize;

    const docs = await mongoDb
      .collection("posts")
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      posts: docs.map(({ _id, ...rest }: any) => rest as Post),
      total,
      totalPages,
      currentPage: validPage,
    };
  },

  async getPostsByTag(tag: string): Promise<Post[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("posts")
      .find({ tags: tag })
      .sort({ uploadDate: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  async getPaginatedPostsByTag(
    tag: string,
    page = 1,
    pageSize = 12
  ): Promise<{
    posts: Post[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    await ensureInit();
    const regex = new RegExp(`^${tag.replace(/-/g, "[- ]?")}$`, "i");
    const query = { tags: { $regex: regex } };

    const total = await mongoDb.collection("posts").countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.max(1, Math.min(page, totalPages));
    const skip = (validPage - 1) * pageSize;

    const docs = await mongoDb
      .collection("posts")
      .find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      posts: docs.map(({ _id, ...rest }: any) => rest as Post),
      total,
      totalPages,
      currentPage: validPage,
    };
  },

  async searchPosts(query: string): Promise<Post[]> {
    await ensureInit();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const regex = new RegExp(trimmed, "i");
    const docs = await mongoDb
      .collection("posts")
      .find({
        $or: [
          { title: { $regex: regex } },
          { description: { $regex: regex } },
          { tags: { $in: [regex] } },
          { category: { $regex: regex } },
        ],
      })
      .sort({ uploadDate: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  async getPaginatedSearchPosts(
    searchQuery: string,
    page = 1,
    pageSize = 12
  ): Promise<{
    posts: Post[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    await ensureInit();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return { posts: [], total: 0, totalPages: 1, currentPage: 1 };
    }

    const regex = new RegExp(trimmed, "i");
    const mongoQuery = {
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { tags: { $in: [regex] } },
        { category: { $regex: regex } },
      ],
    };

    const total = await mongoDb.collection("posts").countDocuments(mongoQuery);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.max(1, Math.min(page, totalPages));
    const skip = (validPage - 1) * pageSize;

    const docs = await mongoDb
      .collection("posts")
      .find(mongoQuery)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      posts: docs.map(({ _id, ...rest }: any) => rest as Post),
      total,
      totalPages,
      currentPage: validPage,
    };
  },

  async getRelatedPosts(currentPost: Post, limit = 8): Promise<Post[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("posts")
      .find({
        id: { $ne: currentPost.id },
        $or: [
          { category: currentPost.category },
          { tags: { $in: currentPost.tags } },
        ],
      })
      .limit(limit)
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as Post);
  },

  // ─── POST MUTATIONS (ADMIN) ───────────────────────
  async createPost(postData: Omit<Post, "stats"> & { stats?: Partial<Post["stats"]> }): Promise<Post> {
    await ensureInit();
    const post: Post = {
      ...postData,
      stats: {
        views: postData.stats?.views ?? 0,
        likes: postData.stats?.likes ?? 0,
        comments: postData.stats?.comments ?? 0,
        photoCount: postData.images?.length ?? 0,
        videoCount: postData.videoLinks?.length ?? 0,
      },
    };

    await mongoDb.collection("posts").insertOne({ ...post, createdAt: new Date().toISOString() });
    return post;
  },

  async updatePost(id: string, postData: Partial<Post>): Promise<Post | null> {
    await ensureInit();
    const current = await this.getPostById(id);
    if (!current) return null;

    const updated: Post = {
      ...current,
      ...postData,
      stats: {
        ...current.stats,
        ...(postData.stats || {}),
        photoCount: postData.images ? postData.images.length : current.stats.photoCount,
        videoCount: postData.videoLinks ? postData.videoLinks.length : current.stats.videoCount,
      },
    };

    await mongoDb.collection("posts").updateOne(
      { id },
      { $set: { ...updated, updatedAt: new Date().toISOString() } }
    );

    return updated;
  },

  async deletePost(id: string): Promise<boolean> {
    await ensureInit();
    const res = await mongoDb.collection("posts").deleteOne({ id });
    if (res.deletedCount > 0) {
      // Also cleanup associated likes, comments, and saves
      await Promise.all([
        mongoDb.collection("likes").deleteMany({ postId: id }),
        mongoDb.collection("comments").deleteMany({ postId: id }),
        mongoDb.collection("saved_posts").deleteMany({ postId: id }),
      ]);
      return true;
    }
    return false;
  },

  // ─── ENGAGEMENT: VIEWS ────────────────────────────
  async incrementPostViews(postId: string): Promise<void> {
    await ensureInit();
    await mongoDb
      .collection("posts")
      .updateOne({ id: postId }, { $inc: { "stats.views": 1 } });
  },

  // ─── ENGAGEMENT: ONE-WAY LIKES ────────────────────
  async hasUserLiked(userId: string, postId: string): Promise<boolean> {
    await ensureInit();
    const doc = await mongoDb.collection("likes").findOne({ userId, postId });
    return !!doc;
  },

  async likePost(
    userId: string,
    postId: string
  ): Promise<{ success: boolean; alreadyLiked: boolean; likes: number; message: string }> {
    await ensureInit();
    const existing = await mongoDb.collection("likes").findOne({ userId, postId });
    if (existing) {
      const post = await this.getPostById(postId);
      return {
        success: false,
        alreadyLiked: true,
        likes: post?.stats.likes ?? 0,
        message: "You already liked this post",
      };
    }

    const likeId = `like_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();

    await mongoDb.collection("likes").insertOne({
      id: likeId,
      userId,
      postId,
      createdAt,
    });

    await mongoDb
      .collection("posts")
      .updateOne({ id: postId }, { $inc: { "stats.likes": 1 } });

    const post = await this.getPostById(postId);
    return {
      success: true,
      alreadyLiked: false,
      likes: post?.stats.likes ?? 1,
      message: "Post liked!",
    };
  },

  // ─── BOOKMARKS (SAVED POSTS WITH REFERENCING) ──────
  async getSavedPostIds(userId: string): Promise<string[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("saved_posts")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((d: any) => d.postId as string);
  },

  async isPostSaved(userId: string, postId: string): Promise<boolean> {
    await ensureInit();
    const doc = await mongoDb
      .collection("saved_posts")
      .findOne({ userId, postId });
    return !!doc;
  },

  async toggleSavePost(
    userId: string,
    postId: string
  ): Promise<{ saved: boolean }> {
    await ensureInit();
    const isSaved = await this.isPostSaved(userId, postId);
    if (isSaved) {
      await mongoDb
        .collection("saved_posts")
        .deleteOne({ userId, postId });
      return { saved: false };
    } else {
      const id = `save_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const createdAt = new Date().toISOString();
      await mongoDb.collection("saved_posts").insertOne({
        id,
        userId,
        postId,
        createdAt,
      });
      return { saved: true };
    }
  },

  async getSavedPostsForUser(userId: string): Promise<Post[]> {
    await ensureInit();
    const savedIds = await this.getSavedPostIds(userId);
    if (savedIds.length === 0) return [];

    const docs = await mongoDb
      .collection("posts")
      .find({ id: { $in: savedIds } })
      .toArray();

    const postMap = new Map<string, Post>();
    for (const doc of docs) {
      const { _id, ...rest } = doc as any;
      postMap.set(rest.id, rest as Post);
    }

    // Preserve bookmark chronological order
    return savedIds
      .map((id) => postMap.get(id))
      .filter((p): p is Post => Boolean(p));
  },

  // ─── COMMENTS ─────────────────────────────────────
  async getCommentsForPost(postId: string): Promise<CommentItem[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("comments")
      .find({ postId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as CommentItem);
  },

  async addComment(
    postId: string,
    userId: string,
    userName: string,
    userImage: string | null,
    content: string
  ): Promise<CommentItem> {
    await ensureInit();
    const id = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    const comment: CommentItem = {
      id,
      postId,
      userId,
      userName,
      userImage,
      content,
      createdAt,
    };

    await mongoDb.collection("comments").insertOne({ ...comment });
    await mongoDb
      .collection("posts")
      .updateOne({ id: postId }, { $inc: { "stats.comments": 1 } });

    return comment;
  },

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await mongoDb.collection("comments").findOne({ id: commentId });
    if (!comment) return false;

    const res = await mongoDb
      .collection("comments")
      .deleteOne({ id: commentId, userId });

    if (res.deletedCount > 0) {
      await mongoDb
        .collection("posts")
        .updateOne({ id: comment.postId }, { $inc: { "stats.comments": -1 } });
      return true;
    }
    return false;
  },

  // ─── ADMIN DASHBOARD STATS ────────────────────────
  async getAdminStats() {
    await ensureInit();
    const [totalPosts, totalUsers, totalComments, totalLikesAgg, totalViewsAgg] =
      await Promise.all([
        mongoDb.collection("posts").countDocuments(),
        mongoDb.collection("user").countDocuments(),
        mongoDb.collection("comments").countDocuments(),
        mongoDb
          .collection("posts")
          .aggregate([{ $group: { _id: null, total: { $sum: "$stats.likes" } } }])
          .toArray(),
        mongoDb
          .collection("posts")
          .aggregate([{ $group: { _id: null, total: { $sum: "$stats.views" } } }])
          .toArray(),
      ]);

    return {
      totalPosts,
      totalUsers,
      totalComments,
      totalLikes: totalLikesAgg[0]?.total || 0,
      totalViews: totalViewsAgg[0]?.total || 0,
    };
  },

  // ─── UPLOADED VIDEOS (AUTO UPLOADER) ─────────────
  async getUploadedVideos(): Promise<UploadedVideoItem[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("uploaded_videos")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as UploadedVideoItem);
  },

  async getUploadedVideoById(id: string): Promise<UploadedVideoItem | null> {
    await ensureInit();
    const doc = await mongoDb.collection("uploaded_videos").findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as UploadedVideoItem;
  },

  async createUploadedVideo(
    item: Omit<UploadedVideoItem, "id" | "createdAt"> & {
      id?: string;
      createdAt?: string;
    }
  ): Promise<UploadedVideoItem> {
    await ensureInit();
    const video: UploadedVideoItem = {
      ...item,
      id:
        item.id ||
        `uv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || new Date().toISOString(),
    };

    await mongoDb.collection("uploaded_videos").insertOne({ ...video });
    return video;
  },

  async deleteUploadedVideo(id: string): Promise<boolean> {
    await ensureInit();
    const res = await mongoDb.collection("uploaded_videos").deleteOne({ id });
    return res.deletedCount > 0;
  },

  async getUploadedImages(): Promise<UploadedImageItem[]> {
    await ensureInit();
    const docs = await mongoDb
      .collection("uploaded_images")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(({ _id, ...rest }: any) => rest as UploadedImageItem);
  },

  async getUploadedImageById(id: string): Promise<UploadedImageItem | null> {
    await ensureInit();
    const doc = await mongoDb.collection("uploaded_images").findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as UploadedImageItem;
  },

  async createUploadedImage(
    item: Omit<UploadedImageItem, "id" | "createdAt"> & {
      id?: string;
      createdAt?: string;
    }
  ): Promise<UploadedImageItem> {
    await ensureInit();
    const image: UploadedImageItem = {
      ...item,
      id:
        item.id ||
        `img_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || new Date().toISOString(),
    };

    await mongoDb.collection("uploaded_images").insertOne({ ...image });
    return image;
  },

  async deleteUploadedImage(id: string): Promise<boolean> {
    await ensureInit();
    const res = await mongoDb.collection("uploaded_images").deleteOne({ id });
    return res.deletedCount > 0;
  },
};
