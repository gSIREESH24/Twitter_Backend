import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../../config/jwt";
import logger from "../logger/logger";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let rawToken: string | undefined;

  const authHeader = req.headers.authorization;

  if (authHeader) {
    if (!authHeader.startsWith("Bearer ")) {
      return next(new AppError(401, "Invalid authorization format. Must start with 'Bearer '"));
    }
    // Remove "Bearer " and any duplicate "Bearer " prefixes
    rawToken = authHeader.replace(/^(Bearer\s+)+/i, "");
  } else if (req.query.token || req.query.accessToken) {
    // Fallback: Support passing token as URL query parameter (?token=...)
    rawToken = String(req.query.token || req.query.accessToken);
  }

  if (!rawToken) {
    return next(new AppError(401, "Authorization header or token is missing"));
  }

  // Strip leading/trailing quotation marks (" or ') and whitespace
  const cleanToken = rawToken.trim().replace(/^["']|["']$/g, "");

  try {
    const payload = verifyAccessToken(cleanToken);
    req.user = payload;
    next();
  } catch (error: any) {
    logger.warn(`⚠️ Token verification failed: ${error.message || error}`);
    next(new AppError(401, "Invalid or expired token"));
  }
};