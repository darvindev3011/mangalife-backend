import express from "express";
import commentsController from "../controllers/commentsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", commentsController.getComments);
router.post("/", authMiddleware, commentsController.addComment);
router.post( "/:id/like", authMiddleware, commentsController.toggleLike);
router.get("/:id", commentsController.getComment);

export default router;
