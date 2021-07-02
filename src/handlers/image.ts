import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import Config from "../config";
import sharp from "sharp";
import { s3 } from "../utils/aws";

export async function addImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        let { data } = req.body;
        let images = req.files as ({
            image_description: string;
        } & Express.Multer.File)[];

        data = JSON.parse(data);

        images = images.map((img: any, i: number) => ({
            ...img,
            image_description: data[i].image_description,
            category: data[i].category,
        }));

        const resImages: any = [];

        for (let img of images) {
            const format =
                img.mimetype === "image/png" || img.mimetype === "image/svg"
                    ? "png"
                    : "jpeg";
            const file = await sharp(img.buffer)[format]({
                quality: 85,
                mozjpeg: format === "jpeg",
            });

            const imgParams = {
                Bucket: Config.aws.bucketName,
                Key: uuid(),
                Body: file,
                ContentType: `image/${format}`,
            };

            const data = await s3.upload(imgParams).promise();

            const imageId = uuid();
            const {
                rows: [image],
            } = await pool.query(
                `
            INSERT INTO images (
                image_id,
                image_name,
                image_description,
                created_by
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
                [imageId, data.Key, img.image_description, authId]
            );

            resImages.push(image);
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
        const { imageName } = req.params;

        if (!imageName)
            return next({
                status: 400,
                message: "Please supply image name.",
            });

        try {
            await pool.query(
                `
                    DELETE FROM images WHERE image_name=$1
                    `,
                [imageName]
            );
        } catch (err) {
            return next({
                stats: 400,
                message:
                    "Can't delete this image, it's being used some where else.",
            });
        }

        await s3
            .deleteObject({
                Bucket: Config.aws.bucketName,
                Key: imageName as string,
            })
            .promise();

        return res
            .status(200)
            .json({ message: "you have successfully deleted an image." });
    } catch (err) {
        return next(err);
    }
}

export async function getImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { rows: images } = await pool.query(
            `
            SELECT
                i.image_id,
                i.image_name,
                i.image_description,
                i.created_at
            FROM images i
                LEFT JOIN users u ON u.user_id=i.created_by
            `
        );

        return res.status(200).json(images);
    } catch (err) {
        return next(err);
    }
}
