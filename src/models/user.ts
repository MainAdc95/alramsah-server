export interface IUser {
    user_id: string;
    avatar: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    is_admin: boolean;
    is_super_admin: boolean;
    is_editor: boolean;
    is_reporter: boolean;
    is_blocked: boolean;
    is_active: boolean;
    version: number;
}
