import { IImage } from "./image";
import { IUser } from "./user";

export interface IMessage {
    message_id: string;
    subject: string;
    text: string;
    is_viewed: boolean;
    images: IImage[];
    created_at: Date;
    created_by: IUser;
}
