import type { User } from "shared/User";
import { Post } from "./Post";
import { GetServerSidePropsContext } from "next";
import axios from "axios";
import image from "public/blank-profile-pic.webp";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const posts = await axios.get("localhost:3000/api/posts");
    const res = posts.data;
}

export function Feed() {
    return (
        <>
        </>
    );
}