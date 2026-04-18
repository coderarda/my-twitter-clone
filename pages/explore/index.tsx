import { GetServerSideProps } from "next";
import { HomeHeader } from "components/HomeHeader";
import Head from "next/head";
import styles from "../../styles/Home.module.css";
import exploreStyles from "../../styles/Explore.module.css";
import Link from "next/link";
import { prisma } from "../../lib/prisma";

type ExploreProps = {
    trendingPosts: {
        postId: number;
        content: string;
        likes: number;
        username: string;
    }[];
    activeUsers: {
        username: string;
        name: string;
        lastname: string;
        posts: number;
    }[];
};

export const getServerSideProps: GetServerSideProps<ExploreProps> = async function () {
    const [posts, users] = await Promise.all([
        prisma.feedPosts.findMany({
            include: {
                likes: true,
                user: true,
            },
            orderBy: {
                postDate: "desc",
            },
            take: 30,
        }),
        prisma.users.findMany({
            include: {
                _count: {
                    select: {
                        mainposts: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        }),
    ]);

    const trendingPosts = posts
        .map((post) => ({
            postId: post.postId,
            content: post.postContent,
            likes: post.likes.length,
            username: post.user.username,
        }))
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 7);

    const activeUsers = users
        .map((user) => ({
            username: user.username,
            name: user.name,
            lastname: user.lastname,
            posts: user._count.mainposts,
        }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 7);

    return {
        props: {
            trendingPosts,
            activeUsers,
        },
    };
};

export default function Explore({ trendingPosts, activeUsers }: ExploreProps) {
    return (
        <>
            <Head>
                <title>Explore | Zwit</title>
            </Head>
            <main className={styles.mainRoot}>
                <div className={styles.home}>
                    <div className={styles.homeFeed}>
                        <HomeHeader pageTitle="Explore" />
                        <section className={exploreStyles.block}>
                            <h2 className={exploreStyles.title}>Trending posts</h2>
                            {trendingPosts.length === 0 ? (
                                <p className={exploreStyles.empty}>No trending posts yet.</p>
                            ) : (
                                trendingPosts.map((post) => (
                                    <article key={post.postId} className={exploreStyles.card}>
                                        <Link href={`/post/${post.postId}`} className={exploreStyles.link}>
                                            <p className={exploreStyles.content}>{post.content}</p>
                                            <p className={exploreStyles.meta}>@{post.username} · {post.likes} likes</p>
                                        </Link>
                                    </article>
                                ))
                            )}
                        </section>
                        <section className={exploreStyles.block}>
                            <h2 className={exploreStyles.title}>People to watch</h2>
                            {activeUsers.length === 0 ? (
                                <p className={exploreStyles.empty}>No users found.</p>
                            ) : (
                                activeUsers.map((profile) => (
                                    <article key={profile.username} className={exploreStyles.card}>
                                        <Link href={`/profile/${profile.username}`} className={exploreStyles.link}>
                                            <p className={exploreStyles.content}>{profile.name} {profile.lastname}</p>
                                            <p className={exploreStyles.meta}>@{profile.username} · {profile.posts} posts</p>
                                        </Link>
                                    </article>
                                ))
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}