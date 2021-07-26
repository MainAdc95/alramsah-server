import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import Config from "../config";
import sharp from "sharp";
import { s3 } from "../utils/aws";
import sizeOf from "image-size";

export async function addImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        let { images } = req.body;

        if (images.length > 10)
            return next({
                status: 400,
                message: "You can only upload 10 images at once.",
            });

        const resImages: any = [];

        for (let img of images as {
            image_description: string;
            img: string;
        }[]) {
            const buffer = Buffer.from(
                img.img.replace(/^data:image\/[a-zA-Z+]+;base64,/, ""),
                "base64"
            );

            let { height, width, type } = sizeOf(buffer);

            const format =
                type === "image/png" || type === "image/svg" ? "png" : "jpeg";

            let sizes = { s: "", m: "", l: "" };

            if (height && width) {
                for (let size of Object.keys(sizes)) {
                    let file: any;

                    if (size === "l") {
                        file = await sharp(buffer)[format]({
                            quality: 80,
                            mozjpeg: format === "jpeg",
                        });
                    } else {
                        file = await sharp(buffer)
                            .resize({
                                height:
                                    size === "m"
                                        ? Math.ceil(height / 2)
                                        : Math.ceil(height / 2 / 2),
                                width:
                                    size === "m"
                                        ? Math.ceil(width / 2)
                                        : Math.ceil(width / 2 / 2),
                            })
                            [format]({
                                quality: 80,
                                mozjpeg: format === "jpeg",
                            });
                    }

                    const imgParams = {
                        Bucket: Config.aws.bucketName,
                        Key: uuid(),
                        Body: file,
                        ContentType: `image/${format}`,
                    };

                    const imgObject = await s3.upload(imgParams).promise();

                    sizes = { ...sizes, [size]: imgObject.Key };
                }

                const imageId = uuid();
                const {
                    rows: [image],
                } = await pool.query(
                    `
                    INSERT INTO images (
                        image_id,
                        sizes,
                        image_description,
                        created_by
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `,
                    [
                        imageId,
                        JSON.stringify(sizes),
                        img.image_description,
                        authId,
                    ]
                );

                resImages.push(image);
            }
        }

        return res.status(200).json(resImages);
    } catch (err) {
        return next(err);
    }
}

export async function deleteImage(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { imageId } = req.params;

        if (!imageId)
            return next({
                status: 400,
                message: "Please supply image id.",
            });

        const {
            rows: [{ sizes }],
        } = await pool.query(`SELECT sizes FROM images WHERE image_id=$1`, [
            imageId,
        ]);

        try {
            await pool.query(
                `
                    DELETE FROM images WHERE image_id=$1
                    `,
                [imageId]
            );
        } catch (err) {
            return next({
                stats: 400,
                message:
                    "Can't delete this image, it's being used some where else.",
            });
        }

        for (const imageName of Object.values(sizes)) {
            await s3
                .deleteObject({
                    Bucket: Config.aws.bucketName,
                    Key: imageName as string,
                })
                .promise();
        }

        return res
            .status(200)
            .json({ message: "you have successfully deleted an image." });
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

export async function getImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        let { p, r, date, search }: any = req.query;

        p = Number(p);
        r = r ? Number(r) : 20;

        let {
            rows: [{ results }],
        } = await pool.query(
            `
            SELECT 
                COUNT(*) as results 
            FROM images
            ${search ? `WHERE image_description LIKE '%${search}%'` : ""}
            `
        );

        results = Number(results);

        const { rows: images } = await pool.query(
            `
            SELECT
                i.image_id,
                i.sizes,
                i.image_description,
                i.created_at
            FROM images i
                LEFT JOIN users u ON u.user_id=i.created_by
            ${search ? `WHERE image_description LIKE '%${search}%'` : ""}
            ORDER BY created_at ${date === "desc" ? "desc" : "asc"}
            ${r ? `LIMIT ${r}` : ""}
            OFFSET ${sum(p, r)}
            `
        );

        return res.status(200).json({
            results,
            images,
        });
    } catch (err) {
        return next(err);
    }
}
