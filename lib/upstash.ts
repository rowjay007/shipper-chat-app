import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userStatus: (id: string) => `user:status:${id}`,
  roomMessages: (roomId: string, page: number) => `room:${roomId}:messages:${page}`,
  unreadCount: (userId: string) => `user:${userId}:unread`,
}

export const CACHE_TTL = {
  SHORT: 60 * 5,
  MEDIUM: 60 * 15,
  LONG: 60 * 60,
}

