import { FeedPosts, User } from '@prisma/client'

export interface PostProps {
    post: FeedPosts;
    user: User;
}