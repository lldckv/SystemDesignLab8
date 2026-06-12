import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'a-string-secret-at-least-256-bits-long';
const ACCESS_TOKEN_EXPIRES_IN: number =
  Number(process.env.JWT_EXPIRATION) || 2_592_000;

export interface JwtPayload {
  userId: string;
  role: Role;
}

export function signJwt(
  payload: JwtPayload,
  options: SignOptions = {},
): string {
  const signOptions: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    ...options,
  };
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
