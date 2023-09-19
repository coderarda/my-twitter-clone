import { User } from "shared/User";

export interface IPost {
    user: User;
    text: string;
    creationDate: Date;
};
