import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import rssParser from "rss-parser";

// handlers
import errorHandler from "./handlers/error";

// importing routes
import privacyPolicyRoutes from "./routes/privacyPolicy";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import imageRoutes from "./routes/image";
import userImageRoutes from "./routes/userImage";
import sectionRoutes from "./routes/section";
import tagRoutes from "./routes/tag";
import newsRoutes from "./routes/news";
import messageRoutes from "./routes/message";
import articleRoutes from "./routes/article";
import stripRoutes from "./routes/strip";
import fileRoutes from "./routes/file";
import pollRoutes from "./routes/poll";
import newsLetterRoutes from "./routes/newsLetter";

// seed
import bcrypt from "bcrypt";
import { pool } from "./utils/db";
import { v4 as uuid } from "uuid";
import format from "pg-format";
const fs = require("fs");

const createUsers = async () => {
    const file = fs.readFileSync("wpxc_users.json");
    let data = JSON.parse(file);

    for (let user of data[0].data as any) {
        const {
            user_email: email,
            user_pass: password,
            user_nicename: username,
            user_registered: created_at,
        } = user;

        // hashing the password to be stored in the data base.
        const hashPassword = await bcrypt.hash("alramsah123456", 10);

        let userId = uuid();

        // creating a user in the data base
        await pool.query(
            `INSERT INTO users (
                user_id,
                avatar,
                username,
                first_name,
                last_name,
                email,
                phone,
                password,
                version,
                created_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            `,
            [
                userId,
                "2d06f735-f13c-4142-803b-6834648fed2d",
                username,
                "",
                "",
                email,
                "",
                hashPassword,
                1,
                created_at,
            ]
        );
    }
};

const createTags = async () => {
    const file = fs.readFileSync("wpxc_terms.json");
    let data = JSON.parse(file);

    for (let tag of data[0].data as any) {
        const { name: tag_name } = tag;

        let tagId = uuid();
        let date = new Date();

        await pool.query(
            `
            INSERT INTO tags (
                tag_id,
                tag_name,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4)
            `,
            [tagId, tag_name, date, date]
        );
    }
};

const getSection = (section: number) => {
    switch (section) {
        case 4:
            return "0faa2361-e8b8-43c7-b287-5aff7a439e16";
        case 6:
            return "article";
        case 11:
            return "8314107c-975d-41de-b718-6bcb3f16fb31";
        case 12:
            return "832dec03-f3a4-4ebd-99ce-218430b09d62";
        case 13:
            return "0faa2361-e8b8-43c7-b287-5aff7a439e16";
        case 15:
            return "article";
        case 17:
            return "0faa2361-e8b8-43c7-b287-5aff7a439e16";
        case 3837:
            return "0faa2361-e8b8-43c7-b287-5aff7a439e16";
        case 9495:
            return "8314107c-975d-41de-b718-6bcb3f16fb31";
        case 9496:
            return "8314107c-975d-41de-b718-6bcb3f16fb31";
        case 9820:
            return "palestine";
        default:
            return null;
    }
};

const createNews = async () => {
    const file1 = fs.readFileSync("news_images.json");
    let images = JSON.parse(file1);
    const file = fs.readFileSync("news.json");
    let news = JSON.parse(file);

    let count = 0;

    for (let nItem of news[0].data as any) {
        // if (count > 5) break;

        let {
            post_content: text,
            post_title: title,
            post_date: date,
            term_taxonomy_id: section,
        } = nItem;

        let foundImage = images[0].data.find(
            (i: any) => i.post_parent === nItem.ID
        );

        if (foundImage) {
            let { post_title: title, post_date: date, guid: url } = foundImage;

            url = url.split("/uploads/")[1];
            console.log(url);
            const sizes = { s: url, m: url, l: url };

            const imageId = uuid();

            const {
                rows: [image],
            } = await pool.query(
                `
                    INSERT INTO images (
                        image_id,
                        sizes,
                        image_description
                    )
                    VALUES ($1, $2, $3)
                    RETURNING *
                `,
                [imageId, JSON.stringify(sizes), title]
            );

            foundImage = image;
        }

        const subTitles: any = [];

        section = getSection(Number(section));
        // section = getDevSection(Number(section));
        // section = "";
        if (section === "article") {
            let articleId = uuid();

            // ______________________________ add article
            await pool.query(
                `
            INSERT INTO articles (
                ${foundImage ? "thumbnail, " : ""}
                article_id,
                intro,
                title,
                text,
                sub_titles,
                created_at,
                updated_at,
                is_published
            ) VALUES (${
                foundImage ? `'${foundImage.image_id}',` : ""
            } $1, $2, $3, $4, $5, $6, $7, $8
            )
        `,
                [
                    articleId,
                    "",
                    title,
                    text,
                    JSON.stringify(
                        subTitles?.length
                            ? subTitles?.map((s: any) => ({
                                  sub_title_id: uuid(),
                                  sub_title: s.sub_title,
                              }))
                            : []
                    ),
                    date,
                    date,
                    true,
                ]
            );

            continue;
        }

        let newsId = uuid();

        const resources = [{ resource: "الرمسة" }];

        // ______________________________ add news
        await pool.query(
            `
                INSERT INTO news (
                    ${foundImage ? "thumbnail, " : ""}
                    news_id,
                    intro,
                    title,
                    text,
                    sub_titles,
                    resources,
                    created_at,
                    updated_at,
                    is_published
                    ${section ? `, section` : ""}
                    ${section === "palestine" ? `, file` : ""}
                ) VALUES (${
                    foundImage ? `'${foundImage.image_id}',` : ""
                } $1, $2, $3, $4, $5, $6, $7, $8, $9
                ${
                    section === "palestine"
                        ? `, '84330a97-0639-4e9a-9fd2-cd0d860d48fc'`
                        : ""
                }
                ${
                    section
                        ? `, '${
                              section === "palestine"
                                  ? "0faa2361-e8b8-43c7-b287-5aff7a439e16"
                                  : section
                          }'`
                        : ""
                }
                )
            `,
            [
                newsId,
                "",
                title,
                text,
                JSON.stringify(
                    subTitles?.length
                        ? subTitles?.map((s: any) => ({
                              sub_title_id: uuid(),
                              sub_title: s.sub_title,
                          }))
                        : []
                ),
                JSON.stringify(
                    resources?.length
                        ? resources?.map((r: any) => ({
                              resource_id: uuid(),
                              resource: r.resource,
                          }))
                        : []
                ),
                date,
                date,
                true,
            ]
        );

        count++;
    }
};

// createNews();
// createTags();
// createUsers();

// server setup
const app = express();
const port = process.env.PORT || 5000;

// socket
const httpServer = require("http").Server(app);

app.disable("x-powered-by");
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const blackList: string[] = [];
const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (blackList.includes(origin as string))
            callback(Error("You are banned from this server!"));
        callback(null, true);
    },
    credentials: true,
};
app.use(cors(corsOptions));

// routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", privacyPolicyRoutes);
app.use("/api", userImageRoutes);
app.use("/api", imageRoutes);
app.use("/api", newsRoutes);
app.use("/api", sectionRoutes);
app.use("/api", tagRoutes);
app.use("/api", messageRoutes);
app.use("/api", articleRoutes);
app.use("/api", stripRoutes);
app.use("/api", fileRoutes);
app.use("/api", pollRoutes);
app.use("/api", newsLetterRoutes);

let parser = new rssParser();

app.get("/api/rss/:url(*)", async (req, res, next) => {
    try {
        const { url } = req.params;

        let feed = await parser.parseURL(url);

        return res.status(200).json(feed);
    } catch (err) {
        return next(err);
    }
});

// 404 route
app.use((req, res, next) => {
    const err: any = new Error("route not found.");
    err.status = 404;
    next(err);
});

// error handler
app.use(errorHandler);

// start server
httpServer.listen(port, () => console.log(`server started at port ${port}!!!`));
