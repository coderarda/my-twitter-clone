import { FeedPosts, PrismaClient, User } from "@prisma/client";
import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { PostProps } from "shared/PostProps";

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

export const getStaticProps: GetStaticProps<PostProps> = async function (ctx) {
    const params = ctx.params as PageParams;
    const post = await prisma.feedPosts.findUnique({ where: { postId: parseInt(params.id) } });

    return {
        props: {
            post: post, 
            user: await prisma.user.findUnique({ where: { userId: post.User_userId } }),
        }
    };
}

export function Post(props: PostProps) {
    return <Post {...props} ></Post>
}