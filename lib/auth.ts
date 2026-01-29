import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: number;
  fid?: number;
  walletAddress?: string;
  username?: string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', {
      issuer: 'pharos-invaders',
      audience: 'pharos-players',
    }) as any;

    return {
      userId: decoded.userId,
      fid: decoded.fid,
      walletAddress: decoded.walletAddress,
      username: decoded.username,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}
