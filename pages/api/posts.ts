import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prisma';

async function getAuthedDbUser(req: NextApiRequest) {
    const { userId } = getAuth(req);
    if (!userId) {
        return null;
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

    if (!primaryEmail) {
        return null;
    }

    const user = await prisma.users.findUnique({
        where: { email: primaryEmail },
        select: { userId: true },
    });

    return user;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET' && req.query.action === 'thread') {
        const postId = Number(req.query.postId);

        if (!postId || Number.isNaN(postId)) {
            return res.status(400).json({ error: 'Valid postId is required' });
        }

        const post = await prisma.feedPosts.findUnique({
            where: { postId },
            include: {
                user: true,
                likes: true,
                repliedposts: {
                    orderBy: { RepliedPostDate: 'asc' },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json({ post });
    }

    // Handle POST - Create new post
    if (req.method === 'POST' && !req.query.action) {
        try {
            const user = await getAuthedDbUser(req);

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { content } = req.body;

            if (!content || typeof content !== 'string') {
                return res.status(400).json({ error: 'Content is required' });
            }

            if (content.length > 280) {
                return res.status(400).json({ error: 'Content must be 280 characters or less' });
            }

            const post = await prisma.feedPosts.create({
                data: {
                    postContent: content,
                    User_userId: user.userId,
                },
                include: {
                    user: true,
                },
            });
            // Revalidate the home page so new post appears immediately
            try {
                // On-demand ISR revalidation for the main feed page
                // If ISR is disabled or not available, this will be a no-op
                // Path refers to pages/index.tsx
                // @ts-ignore - Next.js injects revalidate at runtime
                await res.revalidate("/");
            } catch (e) {
                console.warn("Revalidate failed", e);
            }

            return res.status(201).json({ post });
        } catch (error) {
            console.error('Error creating post:', error);
            return res.status(500).json({ error: 'Failed to create post' });
        }
    }

    // Handle POST /api/posts?action=like - Like a post
    if (req.method === 'POST' && req.query.action === 'like') {
        try {
            const user = await getAuthedDbUser(req);

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.body;
            const parsedPostId = Number(postId);

            if (!parsedPostId || Number.isNaN(parsedPostId)) {
                return res.status(400).json({ error: 'postId is required' });
            }

            // Check if post exists
            const post = await prisma.feedPosts.findUnique({
                where: { postId: parsedPostId },
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Check if already liked
            const existingLike = await prisma.likes.findUnique({
                where: {
                    userId_postId: {
                        userId: user.userId,
                        postId: parsedPostId,
                    },
                },
            });

            if (existingLike) {
                return res.status(400).json({ error: 'Already liked this post' });
            }

            const like = await prisma.likes.create({
                data: {
                    userId: user.userId,
                    postId: parsedPostId,
                },
            });

            return res.status(201).json({ like });
        } catch (error) {
            console.error('Error liking post:', error);
            return res.status(500).json({ error: 'Failed to like post' });
        }
    }

    // Handle DELETE /api/posts?action=like - Unlike a post
    if (req.method === 'DELETE' && req.query.action === 'like') {
        try {
            const user = await getAuthedDbUser(req);

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.body;
            const parsedPostId = Number(postId);

            if (!parsedPostId || Number.isNaN(parsedPostId)) {
                return res.status(400).json({ error: 'postId is required' });
            }

            const like = await prisma.likes.findUnique({
                where: {
                    userId_postId: {
                        userId: user.userId,
                        postId: parsedPostId,
                    },
                },
            });

            if (!like) {
                return res.status(404).json({ error: 'Like not found' });
            }

            await prisma.likes.delete({
                where: {
                    userId_postId: {
                        userId: user.userId,
                        postId: parsedPostId,
                    },
                },
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error unliking post:', error);
            return res.status(500).json({ error: 'Failed to unlike post' });
        }
    }

    if (req.method === 'POST' && req.query.action === 'reply') {
        try {
            const user = await getAuthedDbUser(req);

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId, content } = req.body;
            const parsedPostId = Number(postId);

            if (!parsedPostId || Number.isNaN(parsedPostId)) {
                return res.status(400).json({ error: 'postId is required' });
            }

            if (!content || typeof content !== 'string') {
                return res.status(400).json({ error: 'Content is required' });
            }

            if (content.length > 280) {
                return res.status(400).json({ error: 'Content must be 280 characters or less' });
            }

            const post = await prisma.feedPosts.findUnique({
                where: { postId: parsedPostId },
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const reply = await prisma.postReplies.create({
                data: {
                    MainPosts_postId: parsedPostId,
                    PostContent: content,
                },
            });

            return res.status(201).json({ reply, userId: user.userId });
        } catch (error) {
            console.error('Error creating reply:', error);
            return res.status(500).json({ error: 'Failed to create reply' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
