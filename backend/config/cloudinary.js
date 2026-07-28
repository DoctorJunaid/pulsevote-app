import {v2 as cloudinary} from "cloudinary";
import multer from "multer";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// storage 
const storage = multer.memoryStorage();
export const upload = multer({storage}).single("image");

export const uploadToCloudinary = (buffer, folder = "polling-app") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

export default cloudinary;