import { IUser } from "./user";

export interface IPollOption {
    option_id: string;
    name: string;
    votes: number;
    created_at: Date;
}

export interface IPoll {
    poll_id: string;
    title: string;
    is_active: boolean;
    created_by: IUser;
    updated_by: IUser;
    updated_at: Date;
    created_at: Date;
}
