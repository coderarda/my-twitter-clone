import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import styles from "../../styles/Account.module.css";

type SyncedUser = {
    userId: number;
    name: string;
    lastname: string;
    username: string;
    email: string;
};

export default function Account() {
    const { signOut } = useClerk();
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [syncError, setSyncError] = useState<string | null>(null);
    const [dbUser, setDbUser] = useState<SyncedUser | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        if (!isSignedIn) {
            router.replace("/auth/signin");
            return;
        }

        let isMounted = true;

        async function syncUser() {
            try {
                setIsSyncing(true);
                setSyncError(null);
                const primaryEmail = user?.primaryEmailAddress?.emailAddress;
                if (!primaryEmail) {
                    if (isMounted) {
                        setSyncError("No primary email found on your account.");
                    }
                    return;
                }

                const response = await fetch("/api/auth/sync-clerk-user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: primaryEmail,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                    }),
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && isMounted && data.user) {
                    const syncedUser = data.user as SyncedUser;
                    setDbUser(syncedUser);
                    setFirstName(syncedUser.name);
                    setLastName(syncedUser.lastname);
                }

                if (!response.ok && isMounted) {
                    setSyncError(data.error || "Failed to sync your account details.");
                }
            } catch {
                if (isMounted) {
                    setSyncError("Failed to sync your account details.");
                }
            } finally {
                if (isMounted) {
                    setIsSyncing(false);
                }
            }
        }

        syncUser();

        return () => {
            isMounted = false;
        };
    }, [isLoaded, isSignedIn, router, user]);

    const handleSaveNames = async () => {
        const primaryEmail = user?.primaryEmailAddress?.emailAddress;

        if (!primaryEmail) {
            setSyncError("No primary email found on your account.");
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            setSyncError("First name and last name are required.");
            return;
        }

        try {
            setIsSaving(true);
            setSaveMessage(null);
            setSyncError(null);

            const response = await fetch("/api/auth/sync-clerk-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: primaryEmail,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    username: user?.username,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setSyncError(data.error || "Failed to save profile details.");
                return;
            }

            if (data.user) {
                setDbUser(data.user as SyncedUser);
            }
            setSaveMessage("Profile updated.");
        } catch {
            setSyncError("Failed to save profile details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } finally {
            router.replace("/auth/signin");
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Account</h1>
            <div className={styles.infoCard}>
                <h2 className={styles.infoTitle}>Profile Details</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>First Name</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                        />
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Last Name</span>
                        <input
                            type="text"
                            className={styles.input}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                        />
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Username</span>
                        <span className={styles.value}>{dbUser?.username || user?.username || "-"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>
                            {dbUser?.email || user?.primaryEmailAddress?.emailAddress || "-"}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleSaveNames}
                    disabled={isSaving || isSyncing}
                >
                    {isSaving ? "Saving..." : "Save Name"}
                </button>
                {isSyncing ? <p className={styles.meta}>Syncing account details...</p> : null}
                {saveMessage ? <p className={styles.meta}>{saveMessage}</p> : null}
                {syncError ? <p className={styles.error}>{syncError}</p> : null}
            </div>
            <button type="button" className={styles.signOutButton} onClick={handleSignOut}>
                Sign out
            </button>
        </div>
    );
}