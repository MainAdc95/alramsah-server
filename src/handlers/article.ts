import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { QueryResult } from "pg";
import { IArticle } from "../models/article";
import format from "pg-format";
import { IImage } from "../models/image";
import { ITag } from "../models/tag";

const articleQuery = (
    filter: string,
    order: string,
    limit: string,
    offset: string
) => `
            SELECT
                a.article_id,
                a.intro,
                a.title,
                a.text,
                a.sub_titles,
                a.updated_at,
                a.created_at,
                a.article_order,
                a.is_published,
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
                    'sizes', tn.sizes
                ) END as thumbnail
            FROM articles a
                LEFT JOIN users cb ON cb.user_id=a.created_by
                LEFT JOIN users ub ON ub.user_id=a.updated_by
                LEFT JOIN sections s ON s.section_id=a.section
                LEFT JOIN images tn ON tn.image_id=a.thumbnail
                LEFT JOIN (
                    SELECT
                        nt.article_id,
                        jsonb_build_object (
                            'tag_id', t.tag_id,
                            'tag_name', t.tag_name
                        ) as tag
                    FROM article_tag nt
                        LEFT JOIN tags t ON t.tag_id=nt.tag_id
                ) as t
                    ON t.article_id=a.article_id
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
            ${filter || ""}
            GROUP BY a.article_id, cb.user_id, ub.user_id, s.section_id, tn.image_id
            ${order || "ORDER BY a.created_at desc"}
            ${limit || "LIMIT 100"}
            ${offset || ""}
        `;

export async function getArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { articleId } = req.params;

        const {
            rows: [article],
        }: QueryResult<IArticle> = await pool.query(
            articleQuery("WHERE a.article_id=$1", "", "", ""),
            [articleId]
        );

        return res.status(200).json(article);
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

export async function getArticles(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { p, r, type, sectionId, tag }: any = req.query;

        p = Number(p);
        r = r ? Number(r) : 20;

        let {
            rows: [{ count }],
        } = await pool.query(
            `SELECT count(*) FROM articles n WHERE 
            ${
                tag
                    ? `a.article_id IN (select article_id from article_tag WHERE tag_id='${tag}') AND`
                    : ""
            }
            is_published=${type === "published" ? true : false} ${
                sectionId ? `AND section='${sectionId}'` : ""
            }`
        );

        count = Number(count);

        const { rows: article }: QueryResult<IArticle> = await pool.query(
            articleQuery(
                p
                    ? `WHERE
                    ${sectionId ? `a.section='${sectionId}' AND` : ""}
                    ${
                        tag
                            ? `a.article_id IN (select article_id from article_tag WHERE tag_id='${tag}') AND`
                            : ""
                    }
                    ${`is_published=${type === "published" ? true : false}`}
                    `
                    : "",
                "",
                r ? `LIMIT ${r}` : "",
                `OFFSET ${sum(p, r)}`
            )
        );

        return res.status(200).json({
            results: count,
            article,
        });
    } catch (err) {
        return next(err);
    }
}

export async function addArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        let {
            intro,
            title,
            text,
            section,
            images,
            tags,
            subTitles,
            thumbnail,
        } = req.body;

        title = String(title).trim();
        intro = String(intro).trim();
        text = String(text).trim();

        const articleId = uuid();
        const date = new Date();

        // ______________________________ add article
        await pool.query(
            `
            INSERT INTO article (
                article_id,
                thumbnail,
                intro,
                title,
                text,
                section,
                sub_titles,
                created_by,
                updated_by,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
            [
                articleId,
                (thumbnail as IImage).image_id,
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
                INSERT INTO article_image (
                    article_id,
                    image_id
                ) VALUES %L
                `,
                images.map((i: IImage) => [articleId, i.image_id])
            )
        );

        // ___________________________ tags
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

        return res.status(201).json("");
    } catch (err) {
        return next(err);
    }
}

export async function editArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { articleId } = req.params;
        let {
            intro,
            title,
            text,
            section,
            images,
            tags,
            subTitles,
            thumbnail,
        } = req.body;

        title = String(title).trim();
        intro = String(intro).trim();
        text = String(text).trim();

        const date = new Date();

        // ______________________________ edit article
        await pool.query(
            `
                UPDATE article 
                SET
                    intro=$1,
                    title=$2,
                    text=$3,
                    section=$4,
                    sub_titles=$5,
                    updated_by=$6,
                    updated_at=$7,
                    thumbnail=$8
                WHERE article_id=$9
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
                (thumbnail as IImage).image_id,
                articleId,
            ]
        );

        // ________________________________ article information
        const {
            rows: [info],
        }: QueryResult<{ images: IImage[]; tags: ITag[] }> = await pool.query(
            `
            SELECT
                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,
                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images
            FROM articles a
                LEFT JOIN users cb ON cb.user_id=a.created_by
                LEFT JOIN users ub ON ub.user_id=a.updated_by
                LEFT JOIN sections s ON s.section_id=a.section
                LEFT JOIN (
                    SELECT
                        nt.article_id,
                        jsonb_build_object (
                            'tag_id', t.tag_id,
                            'tag_name', t.tag_name
                        ) as tag
                    FROM article_tag nt
                        LEFT JOIN tags t ON t.tag_id=nt.tag_id
                ) as t
                    ON t.article_id=a.article_id
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
            WHERE a.article_id=$1
            GROUP BY a.article_id, cb.user_id, ub.user_id, s.section_id
            `,
            [articleId]
        );

        // ________________________________ images
        const delImgs: any = [];
        const addImgs: any = [];

        // add / delete logic
        for (let image of images as IImage[]) {
            const foundImg = info.images.find(
                (i) => i.image_id === image.image_id
            );

            if (!foundImg) addImgs.push([articleId, image.image_id]);
        }

        for (let image of info.images) {
            const foundImg = images.find(
                (i: IImage) => i.image_id === image.image_id
            );

            if (!foundImg) delImgs.push([articleId, image.image_id]);
        }

        // add
        if (addImgs.length)
            await pool.query(
                format(
                    `
                INSERT INTO article_image (
                    article_id,
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
                DELETE FROM article_image WHERE (article_id, image_id) IN (%L)
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

            if (!foundTag) addTags.push([articleId, tag.tag_id]);
        }

        for (let tag of info.tags) {
            const foundTag = tags.find((i: ITag) => i.tag_id === tag.tag_id);
            if (!foundTag) delTags.push([articleId, tag.tag_id]);
        }

        // add
        if (addTags.length)
            await pool.query(
                format(
                    `
                INSERT INTO article_tag (
                    article_id,
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
                DELETE FROM article_tag WHERE (article_id, tag_id) IN (%L)
                `,
                    delTags
                )
            );

        return res.status(200).json("");
    } catch (err) {
        return next(err);
    }
}

export async function deleteArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { articleId } = req.params;

        await pool.query(`DELETE FROM articles WHERE article_id=$1`, [
            articleId,
        ]);

        return res
            .status(200)
            .json({ message: "You have successfully deleted article." });
    } catch (err) {
        return next(err);
    }
}

export async function publishArticle(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { articleId } = req.params;

        await pool.query(
            `
            UPDATE article
            SET
                is_published=true
            WHERE article_id=$1
            `,
            [articleId]
        );

        return res
            .status(200)
            .json({ message: "You have successfully published a article." });
    } catch (err) {
        return next(err);
    }
}
