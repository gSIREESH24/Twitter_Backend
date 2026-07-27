import { Request, Response } from "express";
import mediaService from "./media.service";
import { AppError } from "../../common/errors/app-error";
import { asyncHandler } from "../../common/utils/async-handler";

class MediaController {
    upload = asyncHandler(async (req: Request, res: Response) => {
        const targetId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!targetId) {
            throw new AppError(400, "Invalid Tweet ID");
        }

        if (!req.file) {
            throw new AppError(400, "Image is required");
        }

        const media = await mediaService.uploadMedia(
            req.file,
            targetId,
            req.user!.userId
        );

        res.status(201).json({
            success: true,
            data: media,
        });
    });
}

export default new MediaController();