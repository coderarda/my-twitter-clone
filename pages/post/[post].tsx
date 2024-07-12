import { FeedPosts, PrismaClient, Users } from "@prisma/client";
import { Post } from "components/Post";
import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";

interface PageParams extends ParsedUrlQuery {
    id: string;
}

const prisma = new PrismaClient();

export const getStaticPaths: GetStaticPaths<PageParams> = async function () {
    const paths = Array.from<any, { params: PageParams }>({ length: await prisma.feedPosts.count() }, (_, idx) => {
        return {
            params: {
                id: idx.toString(),
            }
        };
    });
    
    return {
        paths,
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps<{ post: FeedPosts, user: Users | null }> = async function (ctx) {
    const params = ctx.params as PageParams;
    const post = await prisma.feedPosts.findUnique({ where: { postId: parseInt(params.id) }});

    if(post == null) {
        return {
            notFound: true,
        }
    } else {
        return {
            props: {
                post: post, 
                user: await prisma.users.findUnique({ where: { userId: post.User_userId }}),
            }
        };
    }

}

export default function Page({ post, user }: { post: FeedPosts, user: Users }) {
    return <Post title={post.postContent} user={user}></Post>
}