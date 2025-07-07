import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloudinary = require("../config/cloudinary");

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    folder: "hopehub", // Thay đổi tên folder nếu muốn
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  }),
});

// Tạo middleware upload
const upload = multer({ storage: storage });

export default upload;
