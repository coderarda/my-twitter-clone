import { User } from "shared/User";
import { Post } from "./Post";

export function Feed() {
    return(
        <>
            <Post description="sdgsd" user={new User(0, "ardaa", "Arda Akcagöz")}></Post>
        </>
    );
}