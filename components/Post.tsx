import Image from "next/image";
import { User } from "shared/User";
import styles from "styles/Post.module.css";

interface PostProps {
    description: string;
    user: User;
}

export function Post(props: PostProps) {
    return (
        <>
            <div className={styles.userSegment}>
                <Image width={50} height={50} src={props.user.profilePic}></Image>
                <span>{props.user.name + ` @${props.user.username}`}</span>
            </div>
            <span className={styles.description}>{props.description}</span>
        </>
    );
}