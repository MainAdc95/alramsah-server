"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = __importDefault(require("../config"));
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: config_1.default.aws.iamKey,
    secretAccessKey: config_1.default.aws.iamSecret,
});
