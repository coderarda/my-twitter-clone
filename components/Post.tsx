import styles from "styles/Post.module.css";
import img from "public/blank-profile-pic.webp";
import Image from "next/image";
import { PostProps } from "shared/PostProps";

export function Post({ post, user }: PostProps) {
    return (
        <div className={styles.postRoot}>
            <div className={styles.userSegment}>
                <Image width={30} height={30} src={img} className={styles.profilePic}></Image>
                <span className={styles.name}>{user.name}</span>
                <span className={styles.username}>{"@" + user.username}</span>
            </div>
            <span className={styles.description}>{post.postContent}</span>
        </div>
    );
}