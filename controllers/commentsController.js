import commentsService from "../services/commentsService.js";
import { sendResponse } from "../utils/response.js";

// List all comments (with replies) for a post
export async function getComments(req, res) {
  const { postId } = req.query;
  if (!postId) return sendResponse(res, { status: 400, message: "postId is required", error: "postId is required" });
  const userId = req.user?.id;
  const result = await commentsService.listComments(postId, userId);
  if (result.success) {
    sendResponse(res, { status: 200, message: "Comments fetched", data: result.data });
  } else {
    sendResponse(res, { status: 500, message: "Failed to fetch comments", error: result.error });
  }
}

// Add a comment or reply
export async function addComment(req, res) {
  const { postId, text, parentId } = req.body;
  if (!postId || !text) return sendResponse(res, { status: 400, message: "postId and text required", error: "postId and text required" });
  const userId = req.user?.id;
  if (!userId) return sendResponse(res, { status: 401, message: "Unauthorized", error: "Unauthorized" });
  const result = await commentsService.createComment({ postId, text, parentId, userId });
  if (result.success) {
    sendResponse(res, { status: 201, message: "Comment created", data: result.data });
  } else {
    sendResponse(res, { status: 500, message: "Failed to create comment", error: result.error });
  }
}

// Like/unlike a comment
export async function toggleLike(req, res) {
  const commentId = req.params.id;
  const userId = req.user?.id;
  if (!userId) return sendResponse(res, { status: 401, message: "Unauthorized", error: "Unauthorized" });
  const result = await commentsService.toggleCommentLike(commentId, userId);
  if (result.success) {
    sendResponse(res, { status: 200, message: "Toggled like", data: result.data });
  } else {
    sendResponse(res, { status: 500, message: "Failed to toggle like", error: result.error });
  }
}

// Get a single comment (optional)
export async function getComment(req, res) {
  const commentId = req.params.id;
  const userId = req.user?.id;
  const result = await commentsService.getSingleComment(commentId, userId);
  if (result.success) {
    sendResponse(res, { status: 200, message: "Comment fetched", data: result.data });
  } else if (result.error && result.error.message === 'Not found') {
    sendResponse(res, { status: 404, message: "Comment not found", error: result.error });
  } else {
    sendResponse(res, { status: 500, message: "Failed to fetch comment", error: result.error });
  }
}

export default {
  getComments,
  addComment,
  toggleLike,
  getComment,
};