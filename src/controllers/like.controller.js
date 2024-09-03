import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const userId = req.user._id;

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video like removed successfully"));
  }

  const newLike = await Like.create({
    video: videoId,
    likedBy: userId
  });

  if (!newLike) {
    throw new ApiError(500, "Failed to like the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment like removed successfully"));
  }
  
  const newLike = await Like.create({
    comment: commentId,
    likedBy: userId
  });

  if (!newLike) {
    throw new ApiError(500, "Failed to like the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  
  const userId = req.user._id;
  
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet like removed successfully"));
  }
  
  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: userId
  });
  
  if (!newLike) {
    throw new ApiError(500, "Failed to like the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Tweet liked successfully"));

});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId)
      }  
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails"
      }
    },
    {
      $unwind: "$videoDetails"
    },
    {
      $project: {
        _id: 0,
        video: "$videoDetails",
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
