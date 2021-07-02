import { IUser } from "./user";

export type ImageFormat = "png" | "svg" | "jpeg";

export interface IImage {
    image_id: string;
    image_name: string;
    image_description: string;
    updated_by: IUser;
    updated_at: Date;
    created_at: Date;
}
