"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImages = exports.deleteImage = exports.addImages = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var config_1 = __importDefault(require("../config"));
var sharp_1 = __importDefault(require("sharp"));
var aws_1 = require("../utils/aws");
var image_size_1 = __importDefault(require("image-size"));
function addImages(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, images, resImages, _i, _a, img, buffer, _b, height, width, type, format, sizes, _c, _d, size, file, imgParams, imgObject, imageId, image, err_1;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 13, , 14]);
                    authId = req.query.authId;
                    images = req.body.images;
                    if (images.length > 10)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "You can only upload 10 images at once.",
                            })];
                    resImages = [];
                    _i = 0, _a = images;
                    _f.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 12];
                    img = _a[_i];
                    buffer = Buffer.from(img.img.replace(/^data:image\/[a-zA-Z+]+;base64,/, ""), "base64");
                    _b = image_size_1.default(buffer), height = _b.height, width = _b.width, type = _b.type;
                    format = type === "image/png" || type === "image/svg" ? "png" : "jpeg";
                    sizes = { s: "", m: "", l: "" };
                    if (!(height && width)) return [3 /*break*/, 11];
                    _c = 0, _d = Object.keys(sizes);
                    _f.label = 2;
                case 2:
                    if (!(_c < _d.length)) return [3 /*break*/, 9];
                    size = _d[_c];
                    file = void 0;
                    if (!(size === "l")) return [3 /*break*/, 4];
                    return [4 /*yield*/, sharp_1.default(buffer)[format]({
                            quality: 85,
                            mozjpeg: format === "jpeg",
                        })];
                case 3:
                    file = _f.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, sharp_1.default(buffer)
                        .resize({
                        height: size === "m"
                            ? Math.ceil(height / 2)
                            : Math.ceil(height / 2 / 2),
                        width: size === "m"
                            ? Math.ceil(width / 2)
                            : Math.ceil(width / 2 / 2),
                    })[format]({
                        quality: 85,
                        mozjpeg: format === "jpeg",
                    })];
                case 5:
                    file = _f.sent();
                    _f.label = 6;
                case 6:
                    imgParams = {
                        Bucket: config_1.default.aws.bucketName,
                        Key: uuid_1.v4(),
                        Body: file,
                        ContentType: "image/" + format,
                    };
                    return [4 /*yield*/, aws_1.s3.upload(imgParams).promise()];
                case 7:
                    imgObject = _f.sent();
                    sizes = __assign(__assign({}, sizes), (_e = {}, _e[size] = imgObject.Key, _e));
                    _f.label = 8;
                case 8:
                    _c++;
                    return [3 /*break*/, 2];
                case 9:
                    imageId = uuid_1.v4();
                    return [4 /*yield*/, db_1.pool.query("\n                    INSERT INTO images (\n                        image_id,\n                        sizes,\n                        image_description,\n                        created_by\n                    )\n                    VALUES ($1, $2, $3, $4)\n                    RETURNING *\n                ", [
                            imageId,
                            JSON.stringify(sizes),
                            img.image_description,
                            authId,
                        ])];
                case 10:
                    image = (_f.sent()).rows[0];
                    resImages.push(image);
                    _f.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 1];
                case 12: return [2 /*return*/, res.status(200).json(resImages)];
                case 13:
                    err_1 = _f.sent();
                    return [2 /*return*/, next(err_1)];
                case 14: return [2 /*return*/];
            }
        });
    });
}
exports.addImages = addImages;
function deleteImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var imageId, sizes, err_2, _i, _a, imageName, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    imageId = req.params.imageId;
                    if (!imageId)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "Please supply image id.",
                            })];
                    return [4 /*yield*/, db_1.pool.query("SELECT sizes FROM images WHERE image_id=$1", [
                            imageId,
                        ])];
                case 1:
                    sizes = (_b.sent()).rows[0].sizes;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db_1.pool.query("\n                    DELETE FROM images WHERE image_id=$1\n                    ", [imageId])];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _b.sent();
                    return [2 /*return*/, next({
                            stats: 400,
                            message: "Can't delete this image, it's being used some where else.",
                        })];
                case 5:
                    _i = 0, _a = Object.values(sizes);
                    _b.label = 6;
                case 6:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    imageName = _a[_i];
                    return [4 /*yield*/, aws_1.s3
                            .deleteObject({
                            Bucket: config_1.default.aws.bucketName,
                            Key: imageName,
                        })
                            .promise()];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/, res
                        .status(200)
                        .json({ message: "you have successfully deleted an image." })];
                case 10:
                    err_3 = _b.sent();
                    return [2 /*return*/, next(err_3)];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.deleteImage = deleteImage;
function getImages(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var images, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                i.image_id,\n                i.sizes,\n                i.image_description,\n                i.created_at\n            FROM images i\n                LEFT JOIN users u ON u.user_id=i.created_by\n            ")];
                case 1:
                    images = (_a.sent()).rows;
                    return [2 /*return*/, res.status(200).json(images)];
                case 2:
                    err_4 = _a.sent();
                    return [2 /*return*/, next(err_4)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getImages = getImages;
