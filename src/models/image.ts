import { IUser } from "./user";

export type ImageFormat = "png" | "svg" | "jpeg";

export interface IImage {
    image_id: string;
    sizes: { s: string; m: string; l: string };
    image_description: string;
    updated_by: IUser;
    updated_at: Date;
    created_at: Date;
}
