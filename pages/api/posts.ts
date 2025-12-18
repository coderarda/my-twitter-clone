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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        return res.status(201).json({ post });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ error: 'Failed to create post' });
    }
}
