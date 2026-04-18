import styles from "styles/Post.module.css";
import img from "public/blank-profile-pic.webp";
import Image from "next/image";
import type { Users } from "@prisma/client";
import { useState, useCallback } from "react";
import { ChatBubbleIcon, HeartIcon, PaperPlaneIcon, Share1Icon } from "@radix-ui/react-icons";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";

interface PostComponentProps {
    postId: number;
    title: string;
    user: Pick<Users, "name" | "lastname" | "username">;
    initialLikeCount?: number;
    likedByIds?: number[];
    isLikedByUser?: boolean;
}

export function Post({ postId, title, user, initialLikeCount = 0, isLikedByUser = false }: PostComponentProps) {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(isLikedByUser);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = useCallback(async () => {
        if (!isSignedIn) {
            router.push('/auth/signin');
            return;
        }

        setIsLoading(true);
        try {
            if (isLiked) {
                // Unlike
                const response = await fetch('/api/posts?action=like', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId }),
                });

                if (response.ok) {
                    setIsLiked(false);
                    setLikeCount(c => Math.max(0, c - 1));
                } else {
                    alert('Failed to unlike post');
                }
            } else {
                // Like
                const response = await fetch('/api/posts?action=like', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId }),
                });

                if (response.ok) {
                    setIsLiked(true);
                    setLikeCount(c => c + 1);
                } else if (response.status === 400) {
                    // Already liked
                    setIsLiked(true);
                } else {
                    alert('Failed to like post');
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [postId, isSignedIn, isLiked, router]);

    return (
        <div className={styles.postRoot}>
            <div className={styles.userSegment}>
                <Image alt="" width={30} height={30} src={img} className={styles.profilePic}></Image>
                <span className={styles.name}>{user.name + " " + user.lastname}</span>
                <Link className={styles.username} href={`/profile/${user.username}`}>{"@" + user.username}</Link>
            </div>
            <Link href={`/post/${postId}`} className={styles.postLink}>
                <span className={styles.description}>{title}</span>
            </Link>
            <div className={styles.actionsSegment}>
                <button 
                    className={`${styles.action} ${isLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                    disabled={isLoading}
                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                    <HeartIcon /> <span>{likeCount > 0 ? likeCount : 'Like'}</span>
                </button>
                <Link href={`/post/${postId}`} className={styles.action}><ChatBubbleIcon /> Comment</Link>
                <span className={styles.action}><Share1Icon /> Share</span>
                <span className={styles.action}><PaperPlaneIcon /> ReZwit</span>
            </div>
        </div>
    );
}