import Head from "next/head";
import React from "react";
import styles from "../styles/Home.module.css";
import { HomeHeader } from "components/HomeHeader";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { PrismaClient, Prisma } from "@prisma/client";
import { GetStaticProps } from "next";
import { Post } from "components/Post";

type PostsWithUser = Prisma.FeedPostsGetPayload<{ include: { user: true }}>;
type PostWithStringDate = Omit<PostsWithUser, "postDate"> & { postDate: string };

export const getStaticProps: GetStaticProps<{ posts: PostWithStringDate[] }> = async function () {
    const prisma = new PrismaClient();
    const posts = await prisma.feedPosts.findMany({ include: { user: true } });
    const postsWithStrDate = posts.map((post) => {
        const newPost: PostWithStringDate = {
            ...post,
            postDate: post.postDate.toUTCString(),
        }
        return newPost;
    })

    return {
        props: {
            posts: postsWithStrDate,
        }
    }
}

export default function Home({ posts }: { posts: PostsWithUser[] }) {    
    return (
        <>
            <Head>
                <title>Twitter Clone</title>
            </Head>
            <main className={styles.mainRoot}>
                <div className={styles.home}>
                    <div className={styles.homeFeed}>
                        <HomeHeader />
                        <ScrollArea.Root>
                            <ScrollArea.Viewport>
                                {posts.map((post, idx) => {
                                    return <Post user={post.user} key={idx} title={post.postContent}></Post>
                                })}
                            </ScrollArea.Viewport>
                            <ScrollArea.Scrollbar>
                                <ScrollArea.Thumb />
                            </ScrollArea.Scrollbar>
                        </ScrollArea.Root>
                    </div>
                </div>
            </main>
        </>
    );
}
