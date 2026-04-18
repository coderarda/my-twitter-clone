import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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
        const { name, lastname, username, email } = req.body;

        // Validation
        if (!name || !lastname || !username || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        // Create user
        const user = await prisma.users.create({
            data: {
                name,
                lastname,
                username,
                email,
            },
            select: {
                userId: true,
                name: true,
                lastname: true,
                username: true,
                email: true,
            }
        });

        return res.status(201).json({ user });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Failed to create user' });
    }
}
