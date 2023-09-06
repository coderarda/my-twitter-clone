import Image from "next/image";
import { User } from "shared/User";
import styles from "styles/Post.module.css";

interface PostProps {
    description: string;
    user: User;
}

export function Post(props: PostProps) {
    return (
        <div className={styles.postRoot}>
            <div className={styles.userSegment}>
                <Image width={30} height={30} src={props.user.profilePic} className={styles.profilePic}></Image>
                <span className={styles.name}>{props.user.name}</span>
                <span className={styles.username}>{"@" + props.user.username}</span>
            </div>
            <span className={styles.description}>{props.description}</span>
        </div>
    );
}