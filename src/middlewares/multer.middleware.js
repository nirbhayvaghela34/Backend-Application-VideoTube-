import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
// File filter to check the MIME type
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
      // File is an image
      cb(null, true);
  } else if (file.mimetype.startsWith("video/")) {
      // File is a video
      cb(null, true);
  } else {
      // Reject file if it's neither image nor video
      cb(new Error("Only images and videos are allowed"), false);
  }
};

export const upload = multer({ 
    storage, 
    fileFilter,
});