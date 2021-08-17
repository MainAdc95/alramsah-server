import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import { INews } from "../models/news";
import format from "pg-format";
import { IImage } from "../models/image";
import { ITag } from "../models/tag";
import { ISection } from "../models/section";
import { runReport } from "../utils/google";

const newsQuery = (
    isAdmin: boolean,
    filter: string,
    order: string,
    limit: string,
    offset: string
) => `
            SELECT
                n.news_id,
                n.title,
                is_archived,
                count(vi) as readers,
                ${isAdmin ? "n.updated_at," : ""}
                n.created_at,
                ${
                    !isAdmin
                        ? ""
                        : `jsonb_build_object (
                    'user_id', cb.user_id,
                    'username', cb.username
                ) as created_by,
                jsonb_build_object (
                    'user_id', ub.user_id,
                    'username', ub.username
                ) as updated_by,`
                }
                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,
                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (
                    'section_id', s.section_id,
                    'section_name', s.section_name,
                    'color', s.color
                ) END as section,
                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (
                    'image_id', tn.image_id,
                    'sizes', tn.sizes
                ) END as thumbnail
            FROM news n
                LEFT JOIN users cb ON cb.user_id=n.created_by
                LEFT JOIN users ub ON ub.user_id=n.updated_by
                LEFT JOIN sections s ON s.section_id=n.section
                LEFT JOIN images tn ON tn.image_id=n.thumbnail
                LEFT JOIN views vi ON vi.news_id=n.news_id
                LEFT JOIN (
                    SELECT
                        ni.news_id,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'sizes', i.sizes
                        ) as image
                    FROM news_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.news_id=n.news_id
            ${filter || ""}
            GROUP BY n.news_id, ${
                !isAdmin ? "" : "cb.user_id, ub.user_id,"
            } s.section_id, tn.image_id
            ${order || "ORDER BY n.created_at desc"}
            ${limit || "LIMIT 100"}
            ${offset || ""}
        `;

export async function getNews(req: Request, res: Response, next: NextFunction) {
    try {
        const { newsId } = req.params;

        const {
            rows: [news],
        }: QueryResult<INews> = await pool.query(
            `
            SELECT
                n.news_id,
                n.intro,
                n.title,
                n.text,
                n.readers,
                n.sub_titles,
                n.resources,
                n.is_archived,
                n.thumbnail_description,
                n.updated_at,
                n.created_at,
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
                ) END as section,
                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (
                    'image_id', tn.image_id,
                    'image_description', tn.image_description,
                    'sizes', tn.sizes
                ) END as thumbnail,
                CASE WHEN COUNT(f)=0 THEN null ELSE jsonb_build_object (
                    'file_id', f.file_id,
                    'text', f.text,
                    'image', f.image
                ) END as file
            FROM news n
                LEFT JOIN users cb ON cb.user_id=n.created_by
                LEFT JOIN users ub ON ub.user_id=n.updated_by
                LEFT JOIN sections s ON s.section_id=n.section
                LEFT JOIN images tn ON tn.image_id=n.thumbnail
                LEFT JOIN (
                    SELECT
                        f.file_id,
                        f.text,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'image_description', i.image_description,
                            'sizes', i.sizes
                        ) as image
                    FROM files f
                        LEFT JOIN images i ON i.image_id=f.image_id
                ) as f
                    ON f.file_id=n.file
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
                            'sizes', i.sizes
                        ) as image
                    FROM news_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.news_id=n.news_id
            WHERE n.news_id=$1
            GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id, tn.image_id, f.file_id, f.text, f.image
            `,
            [newsId]
        );

        return res.status(200).json(news);
    } catch (err) {
        return next(err);
    }
}

const sum = (times: number, value: number) => {
    let totalValue = 0;

    for (let i = 0; i < times; i++) {
        totalValue += value;
    }

    return totalValue - value;
};

export async function getAllNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let {
            p,
            r,
            type,
            sectionId,
            tag,
            mvn,
            newsId,
            fileId,
            text,
            isAdmin,
            order,
        }: any = req.query;

        p = Number(p);
        r = r ? Number(r) : 20;

        let {
            rows: [{ count }],
        } = await pool.query(
            `SELECT count(*) FROM news n WHERE 
            ${
                tag
                    ? `n.news_id IN (select news_id from news_tag WHERE tag_id='${tag}') AND`
                    : ""
            }
            is_published=${type === "published" ? true : false} AND
            is_archived=${type === "archived" ? true : false}
            ${sectionId ? `AND section='${sectionId}'` : ""}
            ${fileId ? `AND file='${fileId}'` : ""}
            ${text ? `AND n.title LIKE '%${text}%'` : ""}
            `
        );

        count = Number(count);

        const { rows: news }: QueryResult<INews> = await pool.query(
            newsQuery(
                isAdmin ? true : false,
                p
                    ? `WHERE
                    ${fileId ? `n.file='${fileId}' AND` : ""}
                    ${text ? `n.title LIKE '%${text}%' AND` : ""}
                    ${sectionId ? `n.section='${sectionId}' AND` : ""}
                    ${
                        tag
                            ? `n.news_id IN (select news_id from news_tag WHERE tag_id='${tag}') AND`
                            : ""
                    }
                    ${newsId ? `n.news_id != '${newsId}' AND` : ""}
                    is_published=${type === "published" ? true : false} AND
                    is_archived=${type === "archived" ? true : false}
                    `
                    : "",
                mvn
                    ? "ORDER BY n.readers desc"
                    : `ORDER BY  n.created_at ${order || "desc"}`,
                r ? `LIMIT ${r}` : "",
                `OFFSET ${sum(p, r)}`
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
        let {
            intro,
            title,
            text,
            section,
            file,
            images,
            tags,
            subTitles,
            resources,
            thumbnail,
            is_published,
            thumbnail_description,
        } = req.body;

        title = String(title).trim();
        intro = String(intro).trim();
        text = String(text).trim();

        const newsId = uuid();
        const date = new Date();

        // ______________________________ add news
        await pool.query(
            `
            INSERT INTO news (
                ${thumbnail ? "thumbnail, " : ""}
                news_id,
                intro,
                title,
                text,
                sub_titles,
                resources,
                created_by,
                updated_by,
                created_at,
                updated_at,
                is_published,
                thumbnail_description,
                published_at
                ${section ? `, section` : ""}
                ${file ? `, file` : ""}
            ) VALUES (${
                thumbnail ? `'${thumbnail.image_id}',` : ""
            } $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            ${section ? `, '${section}'` : ""}
            ${file ? `, '${file}'` : ""}
            )
        `,
            [
                newsId,
                intro,
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
                authId,
                authId,
                date,
                date,
                is_published,
                thumbnail_description,
                is_published ? date : null,
            ]
        );

        // ________________________________ images
        if (images?.length)
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
        if (tags?.length)
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
        let {
            intro,
            title,
            text,
            section,
            file,
            images,
            tags,
            subTitles,
            resources,
            thumbnail,
            thumbnail_description,
        } = req.body;

        title = String(title).trim();
        intro = String(intro).trim();
        text = String(text).trim();

        const date = new Date();

        // ______________________________ edit news
        await pool.query(
            `
                UPDATE news 
                SET
                    intro=$1,
                    title=$2,
                    text=$3,
                    sub_titles=$4,
                    updated_by=$5,
                    updated_at=$6,
                    resources=$7,
                    thumbnail_description=$8
                    ${section ? `, section='${section}'` : ""}
                    ${
                        thumbnail
                            ? `, thumbnail='${thumbnail.image_id}'`
                            : `, thumbnail=null`
                    }
                    ${file ? `, file='${file}'` : ""}
                WHERE news_id=$9
                `,
            [
                intro,
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
                authId,
                date,
                JSON.stringify(
                    resources?.length
                        ? resources?.map((r: any) => ({
                              resource_id: uuid(),
                              resource: r.resource,
                          }))
                        : []
                ),
                thumbnail_description,
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
                                'sizes', i.sizes
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

export async function transformToArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { newsId } = req.params;

        const {
            rows: [news],
        } = await pool.query(
            `
            SELECT
                n.news_id,
                n.intro,
                n.title,
                n.text,
                n.readers,
                n.sub_titles,
                n.resources,
                n.is_archived,
                n.thumbnail_description,
                n.updated_at,
                n.created_at,
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
                ) END as section,
                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (
                    'image_id', tn.image_id,
                    'image_description', tn.image_description,
                    'sizes', tn.sizes
                ) END as thumbnail,
                CASE WHEN COUNT(f)=0 THEN null ELSE jsonb_build_object (
                    'file_id', f.file_id,
                    'text', f.text,
                    'image', f.image
                ) END as file
            FROM news n
                LEFT JOIN users cb ON cb.user_id=n.created_by
                LEFT JOIN users ub ON ub.user_id=n.updated_by
                LEFT JOIN sections s ON s.section_id=n.section
                LEFT JOIN images tn ON tn.image_id=n.thumbnail
                LEFT JOIN (
                    SELECT
                        f.file_id,
                        f.text,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'image_description', i.image_description,
                            'sizes', i.sizes
                        ) as image
                    FROM files f
                        LEFT JOIN images i ON i.image_id=f.image_id
                ) as f
                    ON f.file_id=n.file
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
                            'sizes', i.sizes
                        ) as image
                    FROM news_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.news_id=n.news_id
            WHERE n.news_id=$1
            GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id, tn.image_id, f.file_id, f.text, f.image
            `,
            [newsId]
        );

        let {
            intro,
            title,
            text,
            images,
            tags,
            subTitles,
            thumbnail,
            is_published,
            created_at,
        } = news;

        const articleId = uuid();
        const date = new Date();

        await pool.query(
            `
            INSERT INTO articles (
                ${thumbnail ? "thumbnail, " : ""}
                article_id,
                intro,
                title,
                text,
                sub_titles,
                created_by,
                updated_by,
                created_at,
                updated_at,
                is_published
            ) VALUES (${
                thumbnail ? `'${thumbnail.image_id}',` : ""
            } $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
        `,
            [
                articleId,
                intro,
                title,
                text,
                JSON.stringify(subTitles || []),
                authId,
                authId,
                created_at,
                date,
                is_published,
            ]
        );

        // ________________________________ images
        if (images?.length)
            await pool.query(
                format(
                    `
                INSERT INTO article_image (
                    article_id,
                    image_id
                ) VALUES %L
                `,
                    images.map((i: IImage) => [articleId, i.image_id])
                )
            );

        // ___________________________ tags
        if (tags?.length)
            await pool.query(
                format(
                    `
            INSERT INTO article_tag (
                article_id,
                tag_id
            ) VALUES %L
            `,
                    tags.map((t: ITag) => [articleId, t.tag_id])
                )
            );

        await pool.query(`DELETE FROM news WHERE news_id=$1`, [newsId]);

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function permanentlyDeleteNews(
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

export async function archiveNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { newsId } = req.params;

        await pool.query(
            `UPDATE news SET is_archived=true, is_published=false WHERE news_id=$1`,
            [newsId]
        );

        return res
            .status(200)
            .json({ message: "You have successfully arhived a news." });
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
                is_published=true,
                is_archived=false,
                published_at=$1
            WHERE news_id=$2
            `,
            [new Date(), newsId]
        );

        return res
            .status(200)
            .json({ message: "You have successfully published a news." });
    } catch (err) {
        return next(err);
    }
}

export async function read(req: Request, res: Response, next: NextFunction) {
    try {
        const { newsId, articleId, sectionId } = req.body;

        const viewId = uuid();
        const date = new Date();

        const viewType = newsId ? "news" : "article";

        await pool.query(
            `
            INSERT INTO views (
                view_id,
                view_type,
                news_id,
                article_id,
                section_id,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [viewId, viewType, newsId, articleId, sectionId, date]
        );

        return res.status(200).json("");
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
                s.created_at,
                s.section_order
            FROM sections s
            WHERE section_id NOT IN ('8314107c-975d-41de-b718-6bcb3f16fb31', '75637908-bea2-4286-8121-e881a6acec8e')
            ORDER BY s.section_order ASC
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
                    CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,
                    CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (
                        'image_id', tn.image_id,
                        'sizes', tn.sizes
                    ) END as thumbnail
                FROM news n
                    LEFT JOIN images tn ON tn.image_id=n.thumbnail
                    LEFT JOIN (
                        SELECT
                            ni.news_id,
                            jsonb_build_object (
                                'image_id', i.image_id,
                                'sizes', i.sizes
                            ) as image
                        FROM news_image ni
                            LEFT JOIN images i ON i.image_id=ni.image_id
                    ) as i
                        ON i.news_id=n.news_id
                WHERE n.is_published=true AND n.section=$1 AND published_at is not null
                GROUP BY n.news_id, tn.image_id
                ORDER BY n.published_at desc
                LIMIT 1
                `,
                [section.section_id]
            );

            section.news = news;
        }

        const { rows: sliderNews } = await pool.query(
            `
            SELECT
                n.news_id,
                n.title,
                n.title,
                n.created_at,
                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (
                    'section_id', s.section_id,
                    'section_name', s.section_name,
                    'color', s.color
                ) END as section,
                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,
                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (
                    'image_id', tn.image_id,
                    'sizes', tn.sizes
                ) END as thumbnail
            FROM news n
                LEFT JOIN images tn ON tn.image_id=n.thumbnail
                LEFT JOIN sections s ON s.section_id=n.section
                LEFT JOIN (
                    SELECT
                        ni.news_id,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'sizes', i.sizes
                        ) as image
                    FROM news_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.news_id=n.news_id
            WHERE n.is_published=true AND published_at is not null AND section is not null
            GROUP BY n.news_id, tn.image_id, s.section_id
            ORDER BY n.published_at desc
            LIMIT 10
            `
        );

        const { rows: strips } = await pool.query(
            `
            SELECT
                s.strip_id,
                s.title,
                s.duration,
                s.link,
                s.type,
                s.created_at
            FROM strips s
            `
        );

        const { rows: files } = await pool.query(
            `
            SELECT
                f.file_id,
                f.text,
                f.created_at,
                jsonb_build_object (
                    'image_id', i.image_id,
                    'sizes', i.sizes
                ) as image
            FROM files f
                LEFT JOIN images i ON i.image_id=f.image_id
            WHERE is_active=true
            `
        );

        const { rows: tmrNews } = await pool.query(
            newsQuery(
                false,
                "WHERE n.created_at > now()::date - 7",
                "ORDER BY n.readers desc, n.created_by DESC",
                "LIMIT 10",
                ""
            )
        );

        const {
            rows: [article],
        } = await pool.query(
            `
            SELECT
                a.article_id,
                a.title,
                a.readers,
                a.created_at,
                jsonb_build_object (
                    'user_id', cb.user_id,
                    'username', cb.username,
                    'avatar', cb.avatar
                ) as created_by,
                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (
                    'image_id', tn.image_id,
                    'sizes', tn.sizes
                ) END as thumbnail
            FROM articles a
                LEFT JOIN images tn ON tn.image_id=a.thumbnail
                LEFT JOIN (
                    SELECT
                        u.user_id,
                        u.username,
                        jsonb_build_object (
                            'image_id', ui.image_id,
                            'sizes', ui.sizes
                        ) as avatar
                    FROM users u
                        LEFT JOIN user_images ui ON ui.image_id=u.avatar
                ) as cb
                    ON cb.user_id=a.created_by
                LEFT JOIN (
                    SELECT
                        ni.article_id,
                        jsonb_build_object (
                            'image_id', i.image_id,
                            'sizes', i.sizes
                        ) as image
                    FROM article_image ni
                        LEFT JOIN images i ON i.image_id=ni.image_id
                ) as i
                    ON i.article_id=a.article_id
                WHERE a.is_published=true
                GROUP BY a.article_id, cb.user_id, cb.username, cb.avatar, tn.image_id
                ORDER BY a.created_at desc
                LIMIT 1
            `
        );

        return res
            .status(200)
            .json({ sections, strips, files, tmrNews, article, sliderNews });
    } catch (err) {
        return next(err);
    }
}

export async function getStatistics(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { dataType, clientDate } = req.query;

        let d = new Date();

        let date: any;

        switch (dataType) {
            case "days":
                date = new Date(d.setDate(d.getDate() - 6));
                break;
            case "weeks":
                date = d.setDate(d.getDate() - 30);
                break;
            case "months":
                date = d.setMonth(d.getMonth() - 12);
                break;
            case "years":
                date = d.setMonth(d.getMonth() - 12 * 3);
                break;
        }

        date.setHours(date.getHours() - 4);
        date.setMinutes(0);
        date.setSeconds(0);

        const { rows: sections } = await pool.query(
            `
            SELECT
                s.section_id,
                s.section_name,
                s.color,
                CASE WHEN COUNT(v)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(
                    jsonb_build_object (
                        'created_at', v.created_at
                    )
                ) END as views
            FROM sections s
                LEFT JOIN (
                    SELECT
                        section_id,
                        created_at
                    FROM views
                    WHERE created_at > $1
                ) v
                    ON v.section_id=s.section_id
            GROUP BY s.section_id
            ORDER BY s.created_at desc
            `,
            [new Date(date)]
        );

        const { rows: views } = await pool.query(
            `
                SELECT
                    created_at
                FROM views
                WHERE created_at > $1
                ORDER BY created_at desc
            `,
            [new Date(date)]
        );

        const { rows: news } = await pool.query(
            `
            SELECT
                created_at
            FROM news
            WHERE is_published AND published_at > $1
            ORDER BY published_at desc 
            `,
            [new Date(date)]
        );

        let trtD = new Date();

        trtD.setHours(0, 0, 0, 0);

        const {
            rows: [{ trtNews }],
        } = await pool.query(
            `
            SELECT
                count(*) as "trtNews"
            FROM views
            WHERE created_at > $1
            `,
            [trtD]
        );

        const { rows: alrVisitors } = await pool.query(
            `
                SELECT
                    visitor_id,
                    user_data,
                    created_at
                FROM visitors
                WHERE created_at > $1
            `,
            [trtD]
        );

        const { rows: latestNews } = await pool.query(
            `
            SELECT
                n.news_id,
                n.title,
                COUNT(v) as views
            FROM news n
                LEFT JOIN views v ON n.news_id=v.news_id
            WHERE is_published=true AND n.published_at > $1
            GROUP BY n.news_id
            ORDER BY views desc
            LIMIT 10
            `,
            [new Date(date)]
        );

        const { rows: news24hr } = await pool.query(
            `
            SELECT
                n.news_id,
                n.title,
                COUNT(v) as views
            FROM news n
                LEFT JOIN views v ON n.news_id=v.news_id
            WHERE is_published=true AND n.published_at > $1
            GROUP BY n.news_id
            ORDER BY views desc
            `,
            [trtD]
        );

        const {
            visitedCountries: visitors,
            visitedCountriesRealtime: RealTimeVisitors,
        } = await runReport();

        return res.status(200).json({
            sections,
            views,
            news,
            latestNews,
            trtNews,
            news24hr,
            visitors: visitors.rows,
            RealTimeVisitors: RealTimeVisitors.rows,
            alrVisitors,
        });
    } catch (err) {
        return next(err);
    }
}
