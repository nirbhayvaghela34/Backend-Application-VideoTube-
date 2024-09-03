import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteAssetFromCloudinary } from "../utils/deleteCloudinaryimage.js";

const getAllVideos = asyncHandler(async (req, res) => {
  // Extract query parameters
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId,
  } = req.query;

  // valid: /small|Ghanshyam/i || invalid:  /\/small|Ghanshyam\/i/i
  const decodedRegex = decodeURIComponent(query);
  console.log("Decoded Regex:", decodedRegex); // Debugging line
  const regexPattern = new RegExp(decodedRegex.replace(/^\/|\/[a-z]*$/g, ""),"i"); // for line 15 replacing is required
  console.log("Regex Pattern:", regexPattern);

  const aggregate = Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        title: { $regex: regexPattern },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1, // Sorting based on the field and order
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };

  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos.videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;
  if (!(title || description)) {
    throw new ApiError(400, "Please provide title and description");
  }

  console.log(req.files);
  const videoLocalFilePath = req.files?.videoFile[0];
  const thumbnailLocalFilePath = req.files?.thumbnail[0];

  if (
    !videoLocalFilePath ||
    !videoLocalFilePath.mimetype.startsWith("video/")
  ) {
    throw new ApiError(400, "Please provide a video ");
  }
  if (
    !thumbnailLocalFilePath ||
    !thumbnailLocalFilePath.mimetype.startsWith("image/")
  ) {
    throw new ApiError(400, "Please provide a thumbnail");
  }

  const videoFile = await uploadOnCloudinary(videoLocalFilePath.path);
  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalFilePath.path);

  if (!(videoFile || thumbnailFile)) {
    throw new ApiError(
      500,
      "Failed to upload video and thumbnail to cloudinary"
    );
  }

  const video = await Video.create({
    title,
    description,
    duration: videoFile.duration,
    videoFile: videoFile.url,
    thumbnail: thumbnailFile.url,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Published Successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched Susseccfully."));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;

  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Please provide a title and description");
  }

  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Please provide a thumbnail");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const video = await Video.findById(videoId);

  const deletedThumbnail = await deleteAssetFromCloudinary(
    video.thumbnail,
    "image"
  );
  if (!deletedThumbnail.success) {
    throw new ApiError(500, "Failed to delete thumbnail from cloudinary");
  }

  video.title = title;
  video.description = description;
  video.thumbnail = thumbnail.url;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    new ApiError(404, "Video Not Found");
  }

  const deletedVideo = await deleteAssetFromCloudinary(
    video.videoFile,
    "video"
  );
  if (!deletedVideo.success) {
    throw new ApiError(500, "Failed to delete Video from cloudinary");
  }

  const result = await Video.deleteOne({ _id: videoId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Deleted Successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json(new ApiResponse(404, null, "Video not found."));
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        "Video Published Status Updated Successfully."
      )
    );
});

const incrementVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { views: video.views }, "Video view count updated successfully"));
})

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
      throw new ApiError(404, "Video not found");
  }

  const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchHistroy: videoId } },
      { new: true }
  );

  if (!user) {
      throw new ApiError(404, "User not found");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, user, "Video added to watch history successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  incrementVideoViews,
  addToWatchHistory,
};
