import styles from "../styles/HomeHeader.module.css";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function HomeHeader({ pageTitle }: { pageTitle: string }) {
    const { user, isSignedIn } = useUser();

    return (
        <div className={styles.rootDiv}>
            <span className={styles.headerText}>{pageTitle}</span>
            <div className={styles.authSection}>
                {isSignedIn ? (
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
                        <Link href="/auth/account" className={styles.authButton}>
                            Account
                        </Link>
                    </div>
                ) : (
                    <Link href="/auth/signin" className={styles.authButton}>
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );
}