import { FeedPosts, PostReplies, Users } from "@prisma/client";
import { Post } from "components/Post";
import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";
import { useState } from "react";
import styles from "../../styles/PostThread.module.css";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { HomeHeader } from "../../components/HomeHeader";
import homeStyles from "../../styles/Home.module.css";

type ReplyWithDate = Omit<PostReplies, "RepliedPostDate"> & { RepliedPostDate: string };

type PageProps = {
    post: FeedPosts;
    user: Pick<Users, "name" | "lastname" | "username">;
    replies: ReplyWithDate[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async function (ctx) {
    const postParam = ctx.params?.post;
    const postId = Number(postParam);

    if (!postParam || Number.isNaN(postId)) {
        return { notFound: true };
    }

    const post = await prisma.feedPosts.findUnique({
        where: { postId },
        include: {
            user: true,
            repliedposts: {
                orderBy: { RepliedPostDate: "asc" },
            },
        },
    });

    if(post == null) {
        return {
            notFound: true,
        };
    } else {
        return {
            props: {
                post: {
                    postId: post.postId,
                    postContent: post.postContent,
                    postDate: post.postDate,
                    User_userId: post.User_userId,
                },
                user: {
                    name: post.user.name,
                    lastname: post.user.lastname,
                    username: post.user.username,
                },
                replies: post.repliedposts.map((reply) => ({
                    ...reply,
                    RepliedPostDate: reply.RepliedPostDate.toUTCString(),
                })),
            },
        };
    }
};

export default function Page({ post, user, replies }: PageProps) {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submitReply(e: React.FormEvent) {
        e.preventDefault();

        if (!isSignedIn) {
            router.push("/auth/signin");
            return;
        }

        if (!content.trim()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/posts?action=reply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId: post.postId,
                    content,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to create reply");
            }

            setContent("");
            router.replace(router.asPath);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create reply");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={homeStyles.mainRoot}>
            <div className={homeStyles.home}>
                <div className={homeStyles.homeFeed}>
                    <HomeHeader pageTitle="Post" />
                    <Post postId={post.postId} title={post.postContent} user={user} />
                    <div className={styles.replyComposer}>
                        <h2 className={styles.sectionTitle}>Replies</h2>
                        <form onSubmit={submitReply} className={styles.replyForm}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={280}
                                placeholder="Post your reply"
                                className={styles.replyInput}
                            />
                            <div className={styles.replyActions}>
                                <span className={styles.charCount}>{content.length}/280</span>
                                <button type="submit" className={styles.replyButton} disabled={isSubmitting || !content.trim()}>
                                    {isSubmitting ? "Replying..." : "Reply"}
                                </button>
                            </div>
                        </form>
                        {error ? <p className={styles.error}>{error}</p> : null}
                    </div>
                    <div className={styles.repliesList}>
                        {replies.length === 0 ? (
                            <p className={styles.emptyState}>No replies yet.</p>
                        ) : (
                            replies.map((reply) => (
                                <article key={reply.postId} className={styles.replyCard}>
                                    <p className={styles.replyContent}>{reply.PostContent}</p>
                                    <p className={styles.replyMeta}>{new Date(reply.RepliedPostDate).toLocaleString()}</p>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}