import { Pool } from "pg";
import Config from "../config";

export const pool = new Pool({
    host: Config.db.main.host,
    port: Config.db.main.port as number,
    user: Config.db.main.user,
    password: Config.db.main.password,
    database: Config.db.main.database,
    ssl: false,
});
