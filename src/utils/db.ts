import { Pool } from "pg";
import Config from "../config";

export const pool = new Pool({
    host: Config.db.main.host,
    port: Config.db.main.port as number,
    user: Config.db.main.user,
    password: Config.db.main.password,
    database: Config.db.main.database,
});

// JWT_SECRET=!sBS@$!s@dsdsadSDF3%!@3vsesad%^#@BEGHsdf#!@3nxd#$^!^@#$vsef@SDF#sdfSDF325gsdf
// DB_MAIN_HOST=localhost
// DB_MAIN_PORT=5432
// DB_MAIN_USER=alramsah
// DB_MAIN_PASSWORD=AlramsahMahmoud
// DB_MAIN_DATABASE=alramsah
// DB_USER_HOST=localhost
// DB_USER_PORT=5432
// DB_USER_USER=alramsah
// DB_USER_PASSWORD=AlramsahMahmoud
// DB_USER_DATABASE=alramsah
// EMAIL_HOST=server.crownphoenixadv.com
// NOREPLY_EMAIL=noreply@alramsah.com
// NOREPLY_PASS=AlramsahMahmoud
// INFO_EMAIL=info@alramsah.com
// INFO_PASS=AlramsahMahmoud
// CONTACT_EMAIL=contact@alramsah.com
// CONTACT_PASS=AlramsahMahmoud
// IAM_KEY=AKIA5HWSM7KYHUQHU677
// IAM_SECRET=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
// BUCKET_NAME=alramsah1
// GOOGLE_APPLICATION_CREDENTIALS=/home/mustafa/Desktop/alramsah/api/alramsah-322206-38ceddb807dc.json

// PGPASSWORD=eznd0y7rz3gkj5u2 psql -U doadmin defaultdb -p 25060 -h alramsah-db-do-user-9442462-0.b.db.ondigitalocean.com < alramsah.sql
