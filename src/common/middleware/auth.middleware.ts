import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../../config/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError(401, "Authorization header is missing"));
  }

  if (!authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Invalid authorization format"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
};