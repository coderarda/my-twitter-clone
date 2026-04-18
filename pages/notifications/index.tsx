import Head from "next/head";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { HomeHeader } from "../../components/HomeHeader";
import homeStyles from "../../styles/Home.module.css";
import styles from "../../styles/Notifications.module.css";
import { prisma } from "../../lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

type NotificationItem = {
    id: string;
    kind: "like" | "reply";
    text: string;
    postId: number;
    createdAt: string;
};

type NotificationsProps = {
    isSignedIn: boolean;
    notifications: NotificationItem[];
};

export const getServerSideProps: GetServerSideProps<NotificationsProps> = async function (ctx) {
    const { userId } = getAuth(ctx.req);

    if (!userId) {
        return {
            props: {
                isSignedIn: false,
                notifications: [],
            },
        };
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;

    if (!primaryEmail) {
        return {
            props: {
                isSignedIn: true,
                notifications: [],
            },
        };
    }

    const user = await prisma.users.findUnique({
        where: { email: primaryEmail },
        select: {
            userId: true,
        },
    });

    if (!user) {
        return {
            props: {
                isSignedIn: true,
                notifications: [],
            },
        };
    }

    const [likes, replies] = await Promise.all([
        prisma.likes.findMany({
            where: {
                post: {
                    User_userId: user.userId,
                },
                NOT: {
                    userId: user.userId,
                },
            },
            include: {
                user: true,
                post: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 30,
        }),
        prisma.postReplies.findMany({
            where: {
                mainposts: {
                    User_userId: user.userId,
                },
            },
            include: {
                mainposts: true,
            },
            orderBy: {
                RepliedPostDate: "desc",
            },
            take: 30,
        }),
    ]);

    const likeNotifications: NotificationItem[] = likes.map((like) => ({
        id: `like-${like.likeId}`,
        kind: "like",
        text: `@${like.user.username} liked your post`,
        postId: like.postId,
        createdAt: like.createdAt.toUTCString(),
    }));

    const replyNotifications: NotificationItem[] = replies.map((reply) => ({
        id: `reply-${reply.postId}`,
        kind: "reply",
        text: `You received a new reply: "${reply.PostContent.slice(0, 90)}${reply.PostContent.length > 90 ? "..." : ""}"`,
        postId: reply.MainPosts_postId,
        createdAt: reply.RepliedPostDate.toUTCString(),
    }));

    const notifications = [...likeNotifications, ...replyNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);

    return {
        props: {
            isSignedIn: true,
            notifications,
        },
    };
};

export default function NotificationsPage({ isSignedIn, notifications }: NotificationsProps) {
    return (
        <>
            <Head>
                <title>Notifications | Zwit</title>
            </Head>
            <main className={homeStyles.mainRoot}>
                <div className={homeStyles.home}>
                    <div className={homeStyles.homeFeed}>
                        <HomeHeader pageTitle="Notifications" />
                        {!isSignedIn ? (
                            <div className={styles.emptyWrap}>
                                <p className={styles.emptyText}>Sign in to see your notifications.</p>
                                <Link href="/auth/signin" className={styles.signInButton}>Sign in</Link>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.emptyWrap}>
                                <p className={styles.emptyText}>No notifications yet.</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {notifications.map((notification) => (
                                    <Link key={notification.id} href={`/post/${notification.postId}`} className={styles.card}>
                                        <p className={styles.text}>{notification.text}</p>
                                        <p className={styles.meta}>{new Date(notification.createdAt).toLocaleString()}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
