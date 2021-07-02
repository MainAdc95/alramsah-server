import { IUser } from "./user";

export interface ISection {
    section_id: string;
    section_name: string;
    color: string;
    created_by: IUser;
    updated_by: IUser;
    updated_at: Date;
    created_at: Date;
}
