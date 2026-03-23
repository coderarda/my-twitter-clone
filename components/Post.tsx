import styles from "styles/Post.module.css";
import img from "public/blank-profile-pic.webp";
import Image from "next/image";
import type { Users } from "@prisma/client";
import { useState, useCallback, useEffect } from "react";
import { ChatBubbleIcon, HeartIcon, PaperPlaneIcon, Share1Icon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";

interface PostComponentProps {
    postId: number;
    title: string;
    user: Pick<Users, "name" | "lastname" | "username">;
    initialLikeCount?: number;
    likedByIds?: number[];
    isLikedByUser?: boolean;
}

export function Post({ postId, title, user, initialLikeCount = 0, likedByIds = [], isLikedByUser = false }: PostComponentProps) {
    const { data: session } = useSession();
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(isLikedByUser);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) return;
        const userIdNum = Number(session.user.id);
        if (Number.isNaN(userIdNum)) return;
        const liked = likedByIds.includes(userIdNum);
        setIsLiked(liked);
    }, [session?.user?.id, likedByIds]);

    const handleLike = useCallback(async () => {
        if (!session) {
            alert('Please sign in to like posts');
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
    }, [postId, session, isLiked]);

    return (
        <div className={styles.postRoot}>
            <div className={styles.userSegment}>
                <Image alt="" width={30} height={30} src={img} className={styles.profilePic}></Image>
                <span className={styles.name}>{user.name + " " + user.lastname}</span>
                <span className={styles.username}>{"@" + user.username}</span>
            </div>
            <span className={styles.description}>{title}</span>
            <div className={styles.actionsSegment}>
                <button 
                    className={`${styles.action} ${isLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                    disabled={isLoading}
                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                    <HeartIcon /> <span>{likeCount > 0 ? likeCount : 'Like'}</span>
                </button>
                <span className={styles.action}><ChatBubbleIcon /> Comment</span>
                <span className={styles.action}><Share1Icon /> Share</span>
                <span className={styles.action}><PaperPlaneIcon /> ReZwit</span>
            </div>
        </div>
    );
}