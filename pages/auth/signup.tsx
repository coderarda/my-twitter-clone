import React, { useEffect } from "react";
import Head from "next/head";
import { SignUp as ClerkSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import styles from "../../styles/Auth.module.css";

export default function SignUpPage() {
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
                <title>Sign Up - Zwit</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Create your account</h1>
                    <ClerkSignUp routing="hash" />
                </div>
            </main>
        </>
    );
}
