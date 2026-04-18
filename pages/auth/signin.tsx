import React, { useEffect } from "react";
import Head from "next/head";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import styles from "../../styles/Auth.module.css";

export default function SignIn() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (isSignedIn) {
            router.replace("/auth/account");
        }
    }, [isLoaded, isSignedIn, router]);

    if (isLoaded && isSignedIn) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Sign In - Zwit</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Sign In to Zwit</h1>
                    <div className={styles.form}>
                        <SignInButton mode="modal">
                            <button type="button" className={styles.button}>
                                Sign In
                            </button>
                        </SignInButton>
                    </div>

                    <p className={styles.footer}>
                        Don&apos;t have an account?{" "}
                        <SignUpButton
                            mode="redirect"
                            forceRedirectUrl="/auth/account"
                            fallbackRedirectUrl="/auth/account"
                        >
                            <span className={styles.link}>Sign up</span>
                        </SignUpButton>
                    </p>
                </div>
            </main>
        </>
    );
}
