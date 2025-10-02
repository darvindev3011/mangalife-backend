import { Comment, CommentLike, User } from "../models/index.js";

export async function listComments(postId, currentUserId) {
  try {
    const comments = await Comment.findAll({
      where: { post_id: String(postId), parent_id: null },
      include: [
        {
          model: Comment,
          as: "replies",
          include: [
            { model: User, as: "user", attributes: ["id", "name", "profilePicture"] },
            { model: CommentLike, as: "likes" },
          ],
        },
        { model: User, as: "user", attributes: ["id", "name", "profilePicture"] },
        { model: CommentLike, as: "likes" },
      ],
      order: [["createdAt", "DESC"]],
    });
    function mapComment(c) {
      const likes = c.likes ? c.likes.length : 0;
      const likedByCurrentUser = c.likes?.some(l => l.user_id === currentUserId) || false;
      return {
        id: c.id,
        postId: c.post_id,
        user: c.user,
        text: c.text,
        parentId: c.parent_id,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        likes,
        likedByCurrentUser,
        replies: c.replies?.map(r => mapComment(r)) || [],
      };
    }
    return { success: true, data: comments.map(c => mapComment(c)) };
  } catch (error) {
    console.log('Error fetching comments:', error);
    return { success: false, error };
  }
}

export async function createComment({ postId, text, parentId, userId }) {
  try {
    const comment = await Comment.create({
      post_id: postId,
      user_id: userId,
      text,
      parent_id: parentId || null,
    });
    return { success: true, data: comment };
  } catch (error) {
    return { success: false, error };
  }
}

export async function toggleCommentLike(commentId, userId) {
  try {
    const like = await CommentLike.findOne({ where: { comment_id: commentId, user_id: userId } });
    if (like) {
      await like.destroy();
      return { success: true, data: { liked: false } };
    } else {
      await CommentLike.create({ comment_id: commentId, user_id: userId });
      return { success: true, data: { liked: true } };
    }
  } catch (error) {
    return { success: false, error };
  }
}

export async function getSingleComment(commentId, currentUserId) {
  try {
    const comment = await Comment.findByPk(commentId, {
      include: [
        { model: User, as: "user", attributes: ["id", "name", "avatar"] },
        { model: CommentLike, as: "likes" },
        { model: Comment, as: "replies" },
      ],
    });
    if (!comment) return { success: false, error: new Error('Not found') };
    const likes = comment.likes ? comment.likes.length : 0;
    const likedByCurrentUser = comment.likes?.some(l => l.user_id === currentUserId) || false;
    return {
      success: true,
      data: {
        id: comment.id,
        postId: comment.post_id,
        user: comment.user,
        text: comment.text,
        parentId: comment.parent_id,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        likes,
        likedByCurrentUser,
        replies: comment.replies || [],
      }
    };
  } catch (error) {
    return { success: false, error };
  }
}

export default {
  listComments,
  createComment,
  toggleCommentLike,
  getSingleComment,
};