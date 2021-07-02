import { IUser } from "./user";
import { ITag } from "./tag";
import { ISection } from "./section";

export interface INews {
    news_id: string;
    title: string;
    section: ISection;
    tags: ITag[];
    created_by: IUser;
    updated_by: IUser;
    updated_at: Date;
    created_at: Date;
}
