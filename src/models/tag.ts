import { IUser } from "./user";

export interface ITag {
    tag_id: string;
    name: string;
    created_by: IUser;
    updated_by: IUser;
    updated_at: Date;
    created_at: Date;
}
