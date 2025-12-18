import Head from "next/head";
import React from "react";
import styles from "../styles/Home.module.css";
import { HomeHeader } from "components/HomeHeader";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { PrismaClient, Prisma, FeedPosts } from "@prisma/client";
import { GetServerSideProps } from "next";
import { Post } from "components/Post";
import { CreatePostDialog } from "components/CreatePostDialog";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "../lib/prisma";

type PostsWithUser = Prisma.FeedPostsGetPayload<{ include: { user: true }}>;
type PostWithStringDate = Omit<PostsWithUser, "postDate" | "user"> & { 
    postDate: string;
    user: Omit<PostsWithUser["user"], "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string };
};

export const getServerSideProps: GetServerSideProps<{ posts: PostWithStringDate[] }> = async function (context) {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    // Allow viewing posts without authentication
    // Users can still sign in to post content

    const posts = await prisma.feedPosts.findMany({ 
        include: { user: true },
        orderBy: { postDate: 'desc' },
        take: 50
    });
    const postsWithStrDate = posts.map((post: PostsWithUser) => {
        const newPost: PostWithStringDate = {
            ...post,
            postDate: post.postDate.toUTCString(),
            user: {
                ...post.user,
                createdAt: post.user.createdAt.toUTCString(),
                updatedAt: post.user.updatedAt.toUTCString(),
            }
        }
        return newPost;
    })

    return {
        props: {
            posts: postsWithStrDate,
            session: JSON.parse(JSON.stringify(session)),
        }
    }
}

export default function Home({ posts }: { posts: PostsWithUser[] }) {    
    return (
        <>
            <Head>
                <title>Zwit</title>
            </Head>
            <main className={styles.mainRoot}>
                <div className={styles.home}>
                    <div className={styles.homeFeed}>
                        <HomeHeader />
                        <ScrollArea.Root style={{ height:"100%" }}>
                            <ScrollArea.Viewport className={styles['scroll-area']}>
                                {posts.map((post) => {
                                    return <Post user={post.user} key={post.postId} title={post.postContent}></Post>
                                })}
                            </ScrollArea.Viewport>
                            <ScrollArea.Scrollbar>
                                <ScrollArea.Thumb />
                            </ScrollArea.Scrollbar>
                            <ScrollArea.Corner />
                        </ScrollArea.Root>
                        <CreatePostDialog />
                    </div>
                </div>
            </main>
        </>
    );
}
