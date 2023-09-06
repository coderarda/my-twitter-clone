import { User } from "shared/User";
import { Post } from "./Post";

export function Feed() {
    const user = new User(0, "ardaa", "Arda Akcagöz");
    
    return (
        <>
            <Post description="sdgsd" user={user}></Post>
            <Post description="dasgd" user={user}></Post>
        </>
    );
}