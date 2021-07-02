import Aws from "aws-sdk";
import Config from "../config";

export const s3 = new Aws.S3({
    accessKeyId: Config.aws.iamKey,
    secretAccessKey: Config.aws.iamSecret,
});
