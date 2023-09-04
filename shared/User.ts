export class User {
    readonly id: number;
    _username: string;
    _name: string;
    _numberOfPosts: number;
    // Add posts as a type
    constructor(id: number, username: string, name: string) {
        this.id = id;
        this._username = username;
        this._name = name;
        this._numberOfPosts = 0;
    }
    
    public get username() : string{
        return this._username;
    }

    public set username(username: string) {
        this._username = username;
    }
    
    incrementNumPosts() {
        this._numberOfPosts++;
    }

}