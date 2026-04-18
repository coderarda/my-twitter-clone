import Head from "next/head";
import React from "react";
import styles from "../styles/Home.module.css";
import { HomeHeader } from "../components/HomeHeader";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Prisma } from "@prisma/client";
import { GetStaticProps } from "next";
import { Post } from "../components/Post";
import { CreatePostDialog } from "../components/CreatePostDialog";
// Session is obtained client-side via next-auth hooks when needed

type PostsWithRelations = Prisma.FeedPostsGetPayload<{ include: { user: true, likes: true } }>;
type PostWithStringDate = Omit<PostsWithRelations, "postDate" | "user" | "likes"> & {
    postDate: string;
    user: Omit<PostsWithRelations["user"], "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string };
    likeCount: number;
    likedByIds: number[];
};

export const getStaticProps: GetStaticProps<{ posts: PostWithStringDate[] }> = async function () {
    // Allow viewing posts without authentication
    // Users can still sign in to post content
    const { prisma } = await import("../lib/prisma");

    const postsWithLikes = await prisma.feedPosts.findMany({ 
        include: { 
            user: true,
            likes: true,
        },
        orderBy: { postDate: 'desc' },
        take: 50
    });
    
    const postsWithStrDate = postsWithLikes.map((post) => {
        const { likes, user, postDate, ...rest } = post;
        const newPost: PostWithStringDate = {
            ...rest,
            postDate: postDate.toUTCString(),
            user: {
                ...user,
                createdAt: user.createdAt.toUTCString(),
                updatedAt: user.updatedAt.toUTCString(),
            },
            likeCount: likes.length,
            likedByIds: likes.map((l) => l.userId),
        };
        return newPost;
    })

    return {
        props: {
            posts: postsWithStrDate,
        },
        // Revalidate at most once every 60 seconds (ISR)
        revalidate: 60,
    }
}

export default function Home({ posts }: { posts: PostWithStringDate[] }) {    
    return (
        <>
            <Head>
                <title>Zwit</title>
            </Head>
            <main className={styles.mainRoot}>
                <div className={styles.home}>
                    <div className={styles.homeFeed}>
                        <HomeHeader pageTitle="Home" />
                        <ScrollArea.Root style={{ height:"100%" }}>
                            <ScrollArea.Viewport className={styles['scroll-area']}>
                                {posts.map((post) => {
                                    return <Post 
                                        user={post.user} 
                                        key={post.postId} 
                                        title={post.postContent}
                                        postId={post.postId}
                                        initialLikeCount={post.likeCount}
                                        likedByIds={post.likedByIds}
                                    ></Post>
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
