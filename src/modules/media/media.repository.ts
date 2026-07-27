import { prisma } from "../../config/database";
import { MediaType } from "@prisma/client";
import { mediaSelect } from "./media.select";

class MediaRepository {
    async findTweetById(tweetId: string) {
        return prisma.tweet.findUnique({
            where: {
                id: tweetId,
            },
            select: {
                id: true,
                authorId: true,
            },
        });
    }

    async create(data: {
        url: string;
        publicId: string;
        type: MediaType;
        tweetId: string;
    }) {
        return prisma.media.create({
            data,
            select: mediaSelect,
        });
    }
}

export default new MediaRepository();