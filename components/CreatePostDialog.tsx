import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "../styles/CreatePostDialog.module.css";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";

export function CreatePostDialog() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { isSignedIn } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content: content,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create post');
            }
            
            // Reset form and close dialog
            setContent("");
            setOpen(false);
            
            // Refresh the page to show the new post
            router.replace(router.asPath);
        } catch (error) {
            console.error("Failed to create post:", error);
            setError(error instanceof Error ? error.message : 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className={styles.fab} aria-label="Create post">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content className={styles.content}>
                    {isSignedIn ? (
                        <>
                            <Dialog.Title className={styles.title}>Create a post</Dialog.Title>
                            <Dialog.Description className={styles.description}>
                                Share what's on your mind
                            </Dialog.Description>
                            {error && <div className={styles.error}>{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="What's happening?"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    maxLength={280}
                                    autoFocus
                                />
                                <div className={styles.footer}>
                                    <span className={styles.charCount}>
                                        {content.length}/280
                                    </span>
                                    <div className={styles.actions}>
                                        <Dialog.Close asChild>
                                            <button type="button" className={styles.btnCancel}>
                                                Cancel
                                            </button>
                                        </Dialog.Close>
                                        <button 
                                            type="submit" 
                                            className={styles.btnSubmit}
                                            disabled={!content.trim() || isSubmitting}
                                        >
                                            {isSubmitting ? "Posting..." : "Post"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <Dialog.Title className={styles.title}>Sign in to post</Dialog.Title>
                            <Dialog.Description className={styles.description}>
                                You need to be signed in to create a post.
                            </Dialog.Description>
                            <div className={styles.footer}>
                                <div />
                                <div className={styles.actions}>
                                    <Dialog.Close asChild>
                                        <button type="button" className={styles.btnCancel}>
                                            Cancel
                                        </button>
                                    </Dialog.Close>
                                    <button 
                                        type="button" 
                                        className={styles.btnSubmit}
                                        onClick={() => router.push('/auth/signin')}
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    <Dialog.Close asChild>
                        <button className={styles.iconButton} aria-label="Close">
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
