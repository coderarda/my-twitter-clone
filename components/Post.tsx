import styles from "styles/Post.module.css";
import img from "public/blank-profile-pic.webp";
import Image from "next/image";
import type { Users } from "@prisma/client";

export function Post({ title, user }: { title: string; user: Users }) {
    return (
        <div className={styles.postRoot}>
            <div className={styles.userSegment}>
                <Image width={30} height={30} src={img} className={styles.profilePic}></Image>
                <span className={styles.name}>{user.name + " " + user.lastname}</span>
                <span className={styles.username}>{"@" + user.username}</span>
            </div>
            <span className={styles.description}>{title}</span>
        </div>
    );
}