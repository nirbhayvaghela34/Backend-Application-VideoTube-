import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelId = req.user._id;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const totalVideos = await Video.aggregate([
    { 
      $match: { owner: channelId } 
    },
  ]);

  const totalViews = await Video.aggregate([
    { 
      $match: { owner: channelId } 
    },
    { 
      $group: { _id: null, totalViews: { $sum: "$views" } }
    },
  ]);

  const totalSubscribers = await Subscription.aggregate([
    { 
      $match: { channel: channelId } 
    },
    { 
      $group: { _id: null, totalSubscribers: { $count: {} } }
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $match: {
        video: { $in: totalVideos.map((video) => video._id) },
      }  
    },
    {
      $group: { _id: null, totalLikes: { $count: {} } }
    },
  ]);

  return res.status(200).json(new ApiResponse(200, {
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
  }, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channelId = req.user._id;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

  if (!videos) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
