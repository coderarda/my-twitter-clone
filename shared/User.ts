import Image, { ImageProps, StaticImageData } from "next/image";
import { ReactElement } from "react";
import img from "../public/blank-profile-picture-mystery-man-avatar-973460.webp"

export class User {
    readonly id: number;
    private _username: string;
    private _name: string;
    private _numberOfPosts: number;
    private _profilePic: StaticImageData;
    // Add posts as a type (class)
    constructor(id: number, username: string, name: string) {
        this.id = id;
        this._username = username;
        this._name = name;
        this._numberOfPosts = 0;
        this._profilePic = img;
    }

    public get username(): string {
        return this._username;
    }

    public set username(username: string) {
        this._username = username;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get name(): string {
        return this._name;
    }

    incrementNumPosts() {
        this._numberOfPosts++;
    }

    public get profilePic() {
        return this._profilePic;
    }

    public set profilePic(picture: StaticImageData) {
        this._profilePic = picture;
    }

}