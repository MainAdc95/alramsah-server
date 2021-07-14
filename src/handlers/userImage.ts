import { pool } from "../utils/db";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import Config from "../config";
import sharp from "sharp";
import { s3 } from "../utils/aws";

export async function addUserImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const images = req.files;

        const resUserImages: any = [];

        for (let img of images as Express.Multer.File[]) {
            const format =
                img.mimetype === "image/png" || img.mimetype === "image/svg"
                    ? "png"
                    : "jpeg";
            const file = await sharp(img.buffer)[format]({ quality: 85 });

            const imgParams = {
                Bucket: Config.aws.bucketName,
                Key: uuid(),
                Body: file,
                ContentType: `image/${format}`,
            };

            const data = await s3.upload(imgParams).promise();

            const imageId = uuid();

            const image = await pool.query(
                `
                INSERT INTO user_images (
                    image_id, 
                    image_name,
                    user_id
                )
                VALUES ($1, $2, $3)
                RETURNING * 
                `,
                [imageId, data.Key, authId]
            );

            resUserImages.push(image.rows[0]);
        }

        return res.status(200).json(resUserImages);
    } catch (err) {
        return next(err);
    }
}

export async function deleteUserImage(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { imageName } = req.params;

        if (!imageName)
            return next({
                status: 400,
                message: "please supply image name.",
            });

        try {
            await pool.query(
                `
                    DELETE FROM user_images WHERE image_name=$1
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

export async function getUserImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { authId } = req.query;
        const { rows: images } = await pool.query(
            `
            SELECT
                image_id,
                sizes,
                ui.created_at
            FROM user_images ui
                LEFT JOIN users u ON u.user_id=ui.user_id
            WHERE ui.user_id=$1
            `,
            [authId]
        );

        return res.status(200).json(images);
    } catch (err) {
        return next(err);
    }
}
