import { AppError } from "../../common/errors/app-error";
import { MediaType } from "@prisma/client";
import mediaRepository from "./media.repository";
import { uploadImage } from "../../common/utils/cloudinary";
import fs from "fs";

class MediaService {
    async uploadMedia(
        file: Express.Multer.File,
        tweetId: string,
        userId: string
    ) {
        try {
            const tweet = await mediaRepository.findTweetById(tweetId);

            if (!tweet) {
                throw new AppError(404, "Tweet not found");
            }

            if (tweet.authorId !== userId) {
                throw new AppError(
                    403,
                    "You can upload media only to your own tweets"
                );
            }

            const result = await uploadImage(file.path);

            // Delete temporary file immediately after successful Cloudinary upload
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            return await mediaRepository.create({
                url: result.secure_url,
                publicId: result.public_id,
                type: MediaType.IMAGE,
                tweetId,
            });
        } catch (error) {
            // Ensure temporary file is deleted if validation or upload fails
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw error;
        }
    }
}

export default new MediaService();