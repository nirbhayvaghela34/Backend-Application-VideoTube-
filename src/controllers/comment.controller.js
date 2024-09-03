import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if(!videoId) {
    throw new ApiError(404,"videoId is missing.")
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(videoId)
      }  
    }
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  }

  const comments = await Comment.aggregatePaginate(aggregate, options);
  console.log(comments);
  
  return res
  .status(200)
  .json(
    new ApiResponse(200, comments.docs, `Comments fetched Successfully for ${videoId}`)
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if(!videoId) {
    throw new ApiError(400, "Missing  videoId");
  }
  if(!content) {
    throw new ApiError(400, "Missing content");
  }  

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if(!comment) {
    throw new ApiError(500, "Failed to create comment");
  }

  return res.status(200).json(new ApiResponse(200, comment, "Succeess"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if(!commentId) {
    throw new ApiError(400, "Missing  videoId");
  }
  if(!content) {
    throw new ApiError(400, "Missing content of comment.");
  }  

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      }
    },
    { new: true }
  );

  return res
  .status(200)
  .json(new ApiResponse(200, comment, "Succeess"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if(!commentId) {
    throw new ApiError(400, "Missing commentId");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if(!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
  .status(200).
  json(new ApiResponse(200, deletedComment, "comment deleted Succesfully."));
});

export { getVideoComments, addComment, updateComment, deleteComment };
