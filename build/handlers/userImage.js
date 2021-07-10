"use strict";
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
exports.getUserImages = exports.deleteUserImage = exports.addUserImages = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var config_1 = __importDefault(require("../config"));
var sharp_1 = __importDefault(require("sharp"));
var aws_1 = require("../utils/aws");
function addUserImages(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, images, resUserImages, _i, _a, img, format, file, imgParams, data, imageId, image, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    authId = req.query.authId;
                    images = req.files;
                    resUserImages = [];
                    _i = 0, _a = images;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    img = _a[_i];
                    format = img.mimetype === "image/png" || img.mimetype === "image/svg"
                        ? "png"
                        : "jpeg";
                    return [4 /*yield*/, sharp_1.default(img.buffer)[format]({ quality: 85 })];
                case 2:
                    file = _b.sent();
                    imgParams = {
                        Bucket: config_1.default.aws.bucketName,
                        Key: uuid_1.v4(),
                        Body: file,
                        ContentType: "image/" + format,
                    };
                    return [4 /*yield*/, aws_1.s3.upload(imgParams).promise()];
                case 3:
                    data = _b.sent();
                    imageId = uuid_1.v4();
                    return [4 /*yield*/, db_1.pool.query("\n                INSERT INTO user_images (\n                    image_id, \n                    image_name,\n                    user_id\n                )\n                VALUES ($1, $2, $3)\n                RETURNING * \n                ", [imageId, data.Key, authId])];
                case 4:
                    image = _b.sent();
                    resUserImages.push(image.rows[0]);
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, res.status(200).json(resUserImages)];
                case 7:
                    err_1 = _b.sent();
                    return [2 /*return*/, next(err_1)];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.addUserImages = addUserImages;
function deleteUserImage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var imageName, err_2, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    imageName = req.params.imageName;
                    if (!imageName)
                        return [2 /*return*/, next({
                                status: 400,
                                message: "please supply image name.",
                            })];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db_1.pool.query("\n                    DELETE FROM user_images WHERE image_name=$1\n                    ", [imageName])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    return [2 /*return*/, next({
                            stats: 400,
                            message: "Can't delete this image, it's being used some where else.",
                        })];
                case 4: return [4 /*yield*/, aws_1.s3
                        .deleteObject({
                        Bucket: config_1.default.aws.bucketName,
                        Key: imageName,
                    })
                        .promise()];
                case 5:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "you have successfully deleted an image." })];
                case 6:
                    err_3 = _a.sent();
                    return [2 /*return*/, next(err_3)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.deleteUserImage = deleteUserImage;
function getUserImages(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, images, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    authId = req.query.authId;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                image_id,\n                image_name,\n                ui.created_at\n            FROM user_images ui\n                LEFT JOIN users u ON u.user_id=ui.user_id\n            WHERE ui.user_id=$1\n            ", [authId])];
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
exports.getUserImages = getUserImages;
