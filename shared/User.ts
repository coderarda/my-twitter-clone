import { StaticImageData } from "next/image";

export type User =  {
    username: string;
    name: string;
    profilePic?: StaticImageData;
}