import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import { INews } from "../models/news";
import format from "pg-format";
import { IImage } from "../models/image";
import { ITag } from "../models/tag";
import { ISection } from "../models/section";

const newsQuery = (filter?: string, order?: string, limit?: string) => `
            SELECT
                n.news_id,
                n.intro,
                n.title,
                n.text,
                n.sub_titles,
                n.section,
                n.updated_at,
                n.created_at,
                n.news_order,
                n.is_published,
                jsonb_build_object (
                    'user_id', cb.user_id,
                    'username', cb.username
                ) as created_by,
                jsonb_build_object (
                    'user_id', ub.user_id,
                    'username', ub.username
                ) as updated_by,
                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,
                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,
                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (
                    'section_id', s.section_id,
                    'section_name', s.section_name,
                    'color', s.color
                ) END as section
            FROM news n
                LEFT JOIN users cb ON cb.user_id=n.created_by
                LEFT JOIN users ub ON ub.user_id=n.updated_by
                LEFT JOIN sections s ON s.section_id=n.section
                LEFT JOIN (
                    SELECT
                        nt.news_id,
                        jsonb_build_object (
                            'tag_id', t.tag_id,
                            'tag_name', t.tag_name
                        ) as tag
                    FROM news_tag nt
                        LEFT JOIN tags t ON t.tag_id=nt.tag_id
                ) as t
                    ON t.news_id=n.news_id
                LEFT JOIN (
                    SELECT
                        ni.news_id,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'image_name', i.image_name
                        ) as image
                    FROM news_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.news_id=n.news_id
            ${filter}
            GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id
            ${order || "ORDER BY n.created_at desc"}
            ${limit || "LIMIT 100"}
        `;

export async function getNews(req: Request, res: Response, next: NextFunction) {
    try {
        const { newsId } = req.params;

        const {
            rows: [news],
        }: QueryResult<INews> = await pool.query(
            newsQuery("WHERE n.news_id=$1", ""),
            [newsId]
        );

        return res.status(200).json(news);
    } catch (err) {
        return next(err);
    }
}

export async function getAllNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { p, r, type } = req.query;

        const {
            rows: [{ count }],
        } = await pool.query(`SELECT count(*) FROM news`);

        const { rows: news }: QueryResult<ITag> = await pool.query(
            newsQuery(
                p
                    ? `WHERE ${
                          type === "published"
                              ? `is_published=true AND`
                              : "is_published=false AND"
                      } news_order < ${
                          Number(Number(p) === 1 ? count + 1 : count) /
                          Number(p)
                      }`
                    : "",
                "",
                r ? `LIMIT ${r}` : ""
            )
        );

        return res.status(200).json({
            results: count,
            news,
        });
    } catch (err) {
        return next(err);
    }
}

export async function addNews(req: Request, res: Response, next: NextFunction) {
    try {
        const { authId } = req.query;
        let { intro, title, text, section, images, tags, subTitles } = req.body;

        title = String(title).trim();
        intro = String(intro).trim();
        text = String(text).trim();

        const newsId = uuid();
        const date = new Date();

        // ______________________________ add news
        await pool.query(
            `
            INSERT INTO news (
                news_id,
                intro,
                title,
                text,
                section,
                sub_titles,
                created_by,
                updated_by,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
            [
                newsId,
                intro,
                title,
                text,
                section,
                JSON.stringify(
                    subTitles?.map((s: any) => ({
                        sub_title_id: uuid(),
                        sub_title: s.sub_title,
                    }))
                ),
                authId,
                authId,
                date,
                date,
            ]
        );

        // ________________________________ images
        await pool.query(
            format(
                `
                INSERT INTO news_image (
                    news_id,
                    image_id
                ) VALUES %L
                `,
                images.map((i: IImage) => [newsId, i.image_id])
            )
        );

        // ___________________________ tags
        await pool.query(
            format(
                `
                INSERT INTO news_tag (
                    news_id,
                    tag_id
                ) VALUES %L
                `,
                tags.map((t: ITag) => [newsId, t.tag_id])
            )
        );

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function editNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { newsId } = req.params;
        let { intro, title, text, section, images, tags, subTitles } = req.body;

        title = String(title).trim();
        intro = String(intro).trim();
        text = String(text).trim();

        const date = new Date();

        // ______________________________ add news
        await pool.query(
            `
                UPDATE news 
                SET
                    intro=$1,
                    title=$2,
                    text=$3,
                    section=$4,
                    sub_titles=$5,
                    updated_by=$6,
                    updated_at=$7
                WHERE news_id=$8
                `,
            [
                intro,
                title,
                text,
                section,
                JSON.stringify(
                    subTitles?.map((s: any) => ({
                        sub_title_id: uuid(),
                        sub_title: s.sub_title,
                    }))
                ),
                authId,
                date,
                newsId,
            ]
        );

        // ________________________________ news information
        const {
            rows: [info],
        }: QueryResult<{ images: IImage[]; tags: ITag[] }> = await pool.query(
            `
            SELECT
                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,
                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images
            FROM news n
                LEFT JOIN users cb ON cb.user_id=n.created_by
                LEFT JOIN users ub ON ub.user_id=n.updated_by
                LEFT JOIN sections s ON s.section_id=n.section
                LEFT JOIN (
                    SELECT
                        nt.news_id,
                        jsonb_build_object (
                            'tag_id', t.tag_id,
                            'tag_name', t.tag_name
                        ) as tag
                    FROM news_tag nt
                        LEFT JOIN tags t ON t.tag_id=nt.tag_id
                ) as t
                    ON t.news_id=n.news_id
                LEFT JOIN (
                    SELECT
                        ni.news_id,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'image_name', i.image_name
                        ) as image
                    FROM news_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.news_id=n.news_id
            WHERE n.news_id=$1
            GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id
            `,
            [newsId]
        );

        // ________________________________ images
        const delImgs: any = [];
        const addImgs: any = [];

        // add / delete logic
        for (let image of images as IImage[]) {
            const foundImg = info.images.find(
                (i) => i.image_id === image.image_id
            );

            if (!foundImg) addImgs.push([newsId, image.image_id]);
        }

        for (let image of info.images) {
            const foundImg = images.find(
                (i: IImage) => i.image_id === image.image_id
            );

            if (!foundImg) delImgs.push([newsId, image.image_id]);
        }

        // add
        if (addImgs.length)
            await pool.query(
                format(
                    `
                INSERT INTO news_image (
                    news_id,
                    image_id
                ) VALUES %L
                `,
                    addImgs
                )
            );

        // delete
        if (delImgs.length)
            await pool.query(
                format(
                    `
                DELETE FROM news_image WHERE (news_id, image_id) IN (%L)
                `,
                    delImgs
                )
            );

        // ________________________________ tags
        const delTags: any = [];
        const addTags: any = [];

        // add / delete logic
        for (let tag of tags as ITag[]) {
            const foundTag = info.tags.find((t) => t.tag_id === tag.tag_id);

            if (!foundTag) addTags.push([newsId, tag.tag_id]);
        }

        for (let tag of info.tags) {
            const foundTag = tags.find((i: ITag) => i.tag_id === tag.tag_id);
            if (!foundTag) delTags.push([newsId, tag.tag_id]);
        }

        // add
        if (addTags.length)
            await pool.query(
                format(
                    `
                INSERT INTO news_tag (
                    news_id,
                    tag_id
                ) VALUES %L
                `,
                    addTags
                )
            );

        // delete
        if (delTags.length)
            await pool.query(
                format(
                    `
                DELETE FROM news_tag WHERE (news_id, tag_id) IN (%L)
                `,
                    delTags
                )
            );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deleteNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { newsId } = req.params;

        await pool.query(`DELETE FROM news WHERE news_id=$1`, [newsId]);

        return res
            .status(200)
            .json({ message: "You have successfully deleted news." });
    } catch (err) {
        return next(err);
    }
}

export async function publishNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { newsId } = req.params;

        await pool.query(
            `
            UPDATE news
            SET
                is_published=true
            WHERE news_id=$1
            `,
            [newsId]
        );

        return res
            .status(200)
            .json({ message: "You have successfully published a news." });
    } catch (err) {
        return next(err);
    }
}

export async function homeInfo(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { rows: sections }: QueryResult<ISection & { news: INews[] }> =
            await pool.query(
                `
            SELECT
                s.section_id,
                s.section_name,
                s.color,
                s.created_at
            FROM sections s
            `
            );

        for (let section of sections) {
            const { rows: news } = await pool.query(
                `
                SELECT
                        n.news_id,
                        n.intro,
                        n.section,
                        n.title,
                        n.created_at,
                        n.is_published,
                        CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images
                    FROM news n
                        LEFT JOIN (
                            SELECT
                                ni.news_id,
                                jsonb_build_object (
                                    'image_id', i.image_id,
                                    'image_name', i.image_name
                                ) as image
                            FROM news_image ni
                                LEFT JOIN images i ON i.image_id=ni.image_id
                        ) as i
                            ON i.news_id=n.news_id
                    WHERE n.is_published=true AND n.section=$1
                    GROUP BY n.news_id
                    ORDER BY n.created_at desc
                    LIMIT 6
                `,
                [section.section_id]
            );

            section.news = news;
        }

        return res.status(200).json({ sections });
    } catch (err) {
        return next(err);
    }
}
