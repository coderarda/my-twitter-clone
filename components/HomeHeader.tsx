import styles from "../styles/HomeHeader.module.css";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function HomeHeader() {
    const { data: session } = useSession();

    return (
        <div className={styles.rootDiv}>
            <span className={styles.headerText}>Home</span>
            <div className={styles.authSection}>
                {session ? (
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session.user?.name || session.user?.email}</span>
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