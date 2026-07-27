import jwt from "jsonwebtoken";
import { JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import { env } from "./env";

export interface JwtPayload extends BaseJwtPayload {
  userId: string;
}

const jwtSecret: jwt.Secret = env.JWT_SECRET as string;
const jwtSignOptions: jwt.SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
};

export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, jwtSecret, jwtSignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtSecret) as JwtPayload;
};