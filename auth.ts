import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ 
    adapter: new PrismaPg({ 
        connectionString: process.env.DATABASE_URL || "" 
    }) 
});

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    return null;
                }

                const user = await prisma.users.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user) {
                    return null;
                }

                return {
                    id: user.userId.toString(),
                    email: user.email,
                    name: `${user.name} ${user.lastname}`,
                    username: user.username,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
};

export default NextAuth(authOptions);
