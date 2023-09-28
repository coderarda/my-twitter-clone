import type { FeedPosts } from '@prisma/client'

export interface PostProps {
    posts: FeedPosts[];
}