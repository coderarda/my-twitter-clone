import styles from "../styles/HomeHeader.module.css";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function HomeHeader() {
    const { data: session } = useSession();

    return (
        <div className={styles.rootDiv}>
            <span className={styles.headerText}>Home</span>
            <div className={styles.authSection}>
                {session ? (
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session.user?.name || session.user?.email}</span>
                        <button 
                            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                            className={styles.authButton}
                        >
                            Sign Out
                        </button>
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