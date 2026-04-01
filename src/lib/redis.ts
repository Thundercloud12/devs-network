// lib/redis.ts

import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

/**
 * Lock related operations
 */

export interface LockInfo {
  userId: string;
  username: string;
  blockId: string;
  blockType: string;
  timestamp: number;
}

const LOCK_TTL = 30; // 30 seconds

/**
 * Acquire a lock on a code block
 */
export async function acquireLock(
  roomId: string,
  blockType: string,
  blockId: string,
  userId: string,
  username: string
): Promise<{ success: boolean; message: string; lockedBy?: LockInfo }> {
  const lockKey = `room:${roomId}:lock:${blockType}:${blockId}`;

  // Check if already locked
  const existingLock = await redis.get<LockInfo>(lockKey);

  if (existingLock && existingLock.userId !== userId) {
    return {
      success: false,
      message: `Block is locked by ${existingLock.username}`,
      lockedBy: existingLock,
    };
  }

  // Acquire lock
  const lockData: LockInfo = {
    userId,
    username,
    blockId,
    blockType,
    timestamp: Date.now(),
  };

  await redis.setex(lockKey, LOCK_TTL, JSON.stringify(lockData));

  return {
    success: true,
    message: `Lock acquired for ${blockId}`,
  };
}

/**
 * Release a lock
 */
export async function releaseLock(
  roomId: string,
  blockType: string,
  blockId: string
): Promise<{ success: boolean; message: string }> {
  const lockKey = `room:${roomId}:lock:${blockType}:${blockId}`;
  await redis.del(lockKey);

  return {
    success: true,
    message: `Lock released for ${blockId}`,
  };
}

/**
 * Refresh lock TTL (keep it alive)
 */
export async function refreshLock(
  roomId: string,
  blockType: string,
  blockId: string
): Promise<{ success: boolean; message: string }> {
  const lockKey = `room:${roomId}:lock:${blockType}:${blockId}`;

  const lock = await redis.get<LockInfo>(lockKey);

  if (lock) {
    await redis.setex(lockKey, LOCK_TTL, JSON.stringify(lock));
    return {
      success: true,
      message: `Lock refreshed for ${blockId}`,
    };
  }

  return {
    success: false,
    message: `No lock found for ${blockId}`,
  };
}

/**
 * Get all locks in a room
 */
export async function getRoomLocks(
  roomId: string
): Promise<LockInfo[]> {
  const keys = await redis.keys(`room:${roomId}:lock:*`);

  if (keys.length === 0) {
    return [];
  }

  const locks: LockInfo[] = [];

  for (const key of keys) {
    const lock = await redis.get<LockInfo>(key);
    if (lock) {
      locks.push(lock);
    }
  }

  return locks;
}

/**
 * Get lock for a specific block
 */
export async function getBlockLock(
  roomId: string,
  blockType: string,
  blockId: string
): Promise<LockInfo | null> {
  const lockKey = `room:${roomId}:lock:${blockType}:${blockId}`;
  return await redis.get<LockInfo>(lockKey);
}

/**
 * Release all locks held by a user
 */
export async function releaseLocksByUser(
  roomId: string,
  userId: string
): Promise<{ count: number; message: string }> {
  const keys = await redis.keys(`room:${roomId}:lock:*`);
  let count = 0;

  for (const key of keys) {
    const lock = await redis.get<LockInfo>(key);
    if (lock && lock.userId === userId) {
      await redis.del(key);
      count++;
    }
  }

  return {
    count,
    message: `Released ${count} locks for user ${userId}`,
  };
}

