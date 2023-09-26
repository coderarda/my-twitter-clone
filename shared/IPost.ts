import { User } from "shared/User";

export interface IPost {
    user: User;
    title: string;
    creationDate: Date;
};
