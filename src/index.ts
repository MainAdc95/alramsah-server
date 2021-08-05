import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import rssParser from "rss-parser";
import axios from "axios";

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
import visitorRoutes from "./routes/visitor";
import { pool } from "./utils/db";

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
app.use("/api", visitorRoutes);

let parser = new rssParser();

app.post("/api/rss", async (req, res, next) => {
    try {
        const { url } = req.body;

        const data = await axios.get(url);

        const feed = await parser.parseString(data.data);

        return res.status(200).json(feed);
    } catch (err) {
        return next(err);
    }
});

const createReaders = async () => {
    const { rows: news } = await pool.query(`SELECT * FROM news`);
    const { rows: articles } = await pool.query(`SELECT * FROM articles`);

    for (let item of news) {
        const min = 2500;
        const max = 15000;

        const readers = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log("DSF");
        await pool.query(`UPDATE news SET readers=$1 WHERE news_id=$2`, [
            readers,
            item.news_id,
        ]);
    }

    for (let item of articles) {
        const min = 1;
        const max = 15000;

        const readers = Math.floor(Math.random() * (max - min + 1)) + min;

        await pool.query(`UPDATE articles SET readers=$1 WHERE article_id=$2`, [
            readers,
            item.article_id,
        ]);
    }
};

createReaders();

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
