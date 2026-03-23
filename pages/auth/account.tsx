import { signOut } from 'next-auth/react';
import styles from '../../styles/Account.module.css';

export default function Account() {
    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Account</h1>
            <button type="button" className={styles.signOutButton} onClick={handleSignOut}>
                Sign out
            </button>
        </div>
    );
}