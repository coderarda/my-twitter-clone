import { StaticImageData } from "next/image";

export type User = {
    id: string,
    username: string;
    name: string;
    profilePic?: StaticImageData;
}