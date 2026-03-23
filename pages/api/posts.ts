import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth';

const prisma = new PrismaClient({ 
    adapter: new PrismaPg({ 
        connectionString: process.env.DATABASE_URL || "" 
    }) 
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Handle POST - Create new post
    if (req.method === 'POST' && !req.query.action) {
        try {
            // Get session from NextAuth
            const session = await getServerSession(req, res, authOptions);
            
            if (!session || !session.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { content } = req.body;

            if (!content || typeof content !== 'string') {
                return res.status(400).json({ error: 'Content is required' });
            }

            if (content.length > 280) {
                return res.status(400).json({ error: 'Content must be 280 characters or less' });
            }

            const userId = parseInt(session.user.id);

            const post = await prisma.feedPosts.create({
                data: {
                    postContent: content,
                    User_userId: userId,
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
            const session = await getServerSession(req, res, authOptions);
            
            if (!session || !session.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.body;

            if (!postId || typeof postId !== 'number') {
                return res.status(400).json({ error: 'postId is required' });
            }

            const userId = parseInt(session.user.id);

            // Check if post exists
            const post = await prisma.feedPosts.findUnique({
                where: { postId },
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // Check if already liked
            const existingLike = await prisma.likes.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });

            if (existingLike) {
                return res.status(400).json({ error: 'Already liked this post' });
            }

            const like = await prisma.likes.create({
                data: {
                    userId,
                    postId,
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
            const session = await getServerSession(req, res, authOptions);
            
            if (!session || !session.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { postId } = req.body;

            if (!postId || typeof postId !== 'number') {
                return res.status(400).json({ error: 'postId is required' });
            }

            const userId = parseInt(session.user.id);

            const like = await prisma.likes.findUnique({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });

            if (!like) {
                return res.status(404).json({ error: 'Like not found' });
            }

            await prisma.likes.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error unliking post:', error);
            return res.status(500).json({ error: 'Failed to unlike post' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
