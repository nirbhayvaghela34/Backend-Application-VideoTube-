import {v2 as cloudinary} from 'cloudinary';

const deleteAssetFromCloudinary = async (imageUrl, resourceType = 'image') => {
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0];
    console.log(publicId);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log('Delete Result:', result);

    if (result.result === "ok") {
      return { success: true };
    } else {
      return { success: false };
    }    
  } catch (error) {
    console.error('Delete Error:', error);
    return { success: false };
  }
};

export { deleteAssetFromCloudinary };
