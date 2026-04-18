import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";

type SyncBody = {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
};

function sanitizeName(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }

    return trimmed.slice(0, 45);
}

async function getAvailableUsername(baseUsername: string): Promise<string> {
    const normalizedBase = baseUsername.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 45) || "user";

    for (let i = 0; i < 100; i++) {
        const candidate = i === 0 ? normalizedBase : `${normalizedBase}${i}`.slice(0, 45);
        const existing = await prisma.users.findUnique({
            where: { username: candidate },
            select: { userId: true },
        });

        if (!existing) {
            return candidate;
        }
    }

    return `${normalizedBase}${Date.now().toString().slice(-6)}`.slice(0, 45);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = getAuth(req);
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { email, firstName, lastName, username }: SyncBody = req.body || {};
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const safeFirstName = sanitizeName(firstName);
    const safeLastName = sanitizeName(lastName);
    const preferredUsername = (username || email.split("@")[0] || "user").slice(0, 45);

    try {
        const existingUser = await prisma.users.findUnique({
            where: { email },
            select: { userId: true, username: true, name: true, lastname: true },
        });

        let finalUsername = existingUser?.username || preferredUsername;

        if (!existingUser) {
            finalUsername = await getAvailableUsername(preferredUsername);
        } else if (preferredUsername && preferredUsername !== existingUser.username) {
            const conflictingUser = await prisma.users.findUnique({
                where: { username: preferredUsername },
                select: { userId: true },
            });

            if (!conflictingUser || conflictingUser.userId === existingUser.userId) {
                finalUsername = preferredUsername;
            } else {
                finalUsername = await getAvailableUsername(preferredUsername);
            }
        }

        const user = await prisma.users.upsert({
            where: { email },
            update: {
                name: safeFirstName ?? existingUser?.name ?? "User",
                lastname: safeLastName ?? existingUser?.lastname ?? "User",
                username: finalUsername,
            },
            create: {
                name: safeFirstName ?? "User",
                lastname: safeLastName ?? "User",
                username: finalUsername,
                email,
            },
            select: {
                userId: true,
                name: true,
                lastname: true,
                username: true,
                email: true,
            },
        });

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error syncing Clerk user:", error);
        return res.status(500).json({ error: "Failed to sync user" });
    }
}
