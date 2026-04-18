import Head from "next/head";
import { GetServerSideProps } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HomeHeader } from "../../components/HomeHeader";
import { Post } from "../../components/Post";
import styles from "../../styles/Profile.module.css";
import homeStyles from "../../styles/Home.module.css";

type UserWithPosts = Prisma.UsersGetPayload<{
    include: {
        mainposts: {
            include: {
                likes: true;
            };
            orderBy: {
                postDate: "desc";
            };
            take: 50;
        };
    };
}>;

type PostForClient = {
    postId: number;
    postContent: string;
    likeCount: number;
    likedByIds: number[];
};

type ProfileProps = {
    user: {
        name: string;
        lastname: string;
        username: string;
        joinedAt: string;
    };
    posts: PostForClient[];
    postCount: number;
    likeCount: number;
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async function (ctx) {
    const username = String(ctx.params?.username || "");

    if (!username) {
        return { notFound: true };
    }

    const user = await prisma.users.findUnique({
        where: { username },
        include: {
            mainposts: {
                include: {
                    likes: true,
                },
                orderBy: {
                    postDate: "desc",
                },
                take: 50,
            },
        },
    });

    if (!user) {
        return { notFound: true };
    }

    const typedUser = user as UserWithPosts;
    const posts = typedUser.mainposts.map((post) => ({
        postId: post.postId,
        postContent: post.postContent,
        likeCount: post.likes.length,
        likedByIds: post.likes.map((like) => like.userId),
    }));

    return {
        props: {
            user: {
                name: typedUser.name,
                lastname: typedUser.lastname,
                username: typedUser.username,
                joinedAt: typedUser.createdAt.toUTCString(),
            },
            posts,
            postCount: typedUser.mainposts.length,
            likeCount: typedUser.mainposts.reduce((sum, post) => sum + post.likes.length, 0),
        },
    };
};

export default function ProfilePage({ user, posts, postCount, likeCount }: ProfileProps) {
    return (
        <>
            <Head>
                <title>{`${user.name} ${user.lastname} (@${user.username}) | Zwit`}</title>
            </Head>
            <main className={homeStyles.mainRoot}>
                <div className={homeStyles.home}>
                    <div className={homeStyles.homeFeed}>
                        <HomeHeader pageTitle="Profile" />
                        <section className={styles.profileHeader}>
                            <h1 className={styles.name}>{`${user.name} ${user.lastname}`}</h1>
                            <p className={styles.username}>@{user.username}</p>
                            <p className={styles.meta}>Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
                            <div className={styles.statsRow}>
                                <span>{postCount} posts</span>
                                <span>{likeCount} likes received</span>
                            </div>
                        </section>
                        <section>
                            {posts.length === 0 ? (
                                <p className={styles.emptyState}>This user has not posted yet.</p>
                            ) : (
                                posts.map((post) => (
                                    <Post
                                        key={post.postId}
                                        postId={post.postId}
                                        title={post.postContent}
                                        user={user}
                                        initialLikeCount={post.likeCount}
                                        likedByIds={post.likedByIds}
                                    />
                                ))
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
