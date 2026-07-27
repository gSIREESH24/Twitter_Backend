import cloudinary from "../../config/cloudinary";

export const uploadImage = async (filePath: string) => {
    return cloudinary.uploader.upload(filePath, {
        folder: "twitter-backend",
    });
};
