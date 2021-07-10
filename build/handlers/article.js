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
exports.publishArticle = exports.archiveArticle = exports.permanentlyDeleteArticle = exports.editArticle = exports.addArticle = exports.getArticles = exports.getArticle = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var pg_format_1 = __importDefault(require("pg-format"));
var articleQuery = function (filter, order, limit, offset) { return "\n            SELECT\n                a.article_id,\n                a.intro,\n                a.title,\n                a.text,\n                a.sub_titles,\n                a.is_archived,\n                a.updated_at,\n                a.created_at,\n                a.is_published,\n                jsonb_build_object (\n                    'user_id', cb.user_id,\n                    'username', cb.username\n                ) as created_by,\n                jsonb_build_object (\n                    'user_id', ub.user_id,\n                    'username', ub.username\n                ) as updated_by,\n                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,\n                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,\n                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (\n                    'section_id', s.section_id,\n                    'section_name', s.section_name,\n                    'color', s.color\n                ) END as section,\n                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (\n                    'image_id', tn.image_id,\n                    'sizes', tn.sizes\n                ) END as thumbnail\n            FROM articles a\n                LEFT JOIN users cb ON cb.user_id=a.created_by\n                LEFT JOIN users ub ON ub.user_id=a.updated_by\n                LEFT JOIN sections s ON s.section_id=a.section\n                LEFT JOIN images tn ON tn.image_id=a.thumbnail\n                LEFT JOIN (\n                    SELECT\n                        nt.article_id,\n                        jsonb_build_object (\n                            'tag_id', t.tag_id,\n                            'tag_name', t.tag_name\n                        ) as tag\n                    FROM article_tag nt\n                        LEFT JOIN tags t ON t.tag_id=nt.tag_id\n                ) as t\n                    ON t.article_id=a.article_id\n                LEFT JOIN (\n                    SELECT\n                        ni.article_id,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM article_image ni\n                        LEFT JOIN images i ON i.image_id=ni.image_id\n                ) as i\n                    ON i.article_id=a.article_id\n            " + (filter || "") + "\n            GROUP BY a.article_id, cb.user_id, ub.user_id, s.section_id, tn.image_id\n            " + (order || "ORDER BY a.created_at desc") + "\n            " + (limit || "LIMIT 100") + "\n            " + (offset || "") + "\n        "; };
function getArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var articleId, article, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    articleId = req.params.articleId;
                    return [4 /*yield*/, db_1.pool.query(articleQuery("WHERE a.article_id=$1", "", "", ""), [articleId])];
                case 1:
                    article = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(article)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getArticle = getArticle;
var sum = function (times, value) {
    var totalValue = 0;
    for (var i = 0; i < times; i++) {
        totalValue += value;
    }
    return totalValue - value;
};
function getArticles(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, p, r, type, sectionId, tag, count, articles, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.query, p = _a.p, r = _a.r, type = _a.type, sectionId = _a.sectionId, tag = _a.tag;
                    p = Number(p);
                    r = r ? Number(r) : 20;
                    return [4 /*yield*/, db_1.pool.query("SELECT count(*) FROM articles n WHERE \n            " + (tag
                            ? "a.article_id IN (select article_id from article_tag WHERE tag_id='" + tag + "') AND"
                            : "") + "\n            is_published=" + (type === "published" ? true : false) + " AND\n            is_archived=" + (type === "archived" ? true : false) + "\n            " + (sectionId ? "AND section='" + sectionId + "'" : ""))];
                case 1:
                    count = (_b.sent()).rows[0].count;
                    count = Number(count);
                    return [4 /*yield*/, db_1.pool.query(articleQuery(p
                            ? "WHERE\n                    " + (sectionId ? "a.section='" + sectionId + "' AND" : "") + "\n                    " + (tag
                                ? "a.article_id IN (select article_id from article_tag WHERE tag_id='" + tag + "') AND"
                                : "") + "\n                    is_published=" + (type === "published" ? true : false) + " AND\n                    is_archived=" + (type === "archived" ? true : false) + "\n                    "
                            : "", "", r ? "LIMIT " + r : "", "OFFSET " + sum(p, r)))];
                case 2:
                    articles = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json({
                            results: count,
                            articles: articles,
                        })];
                case 3:
                    err_2 = _b.sent();
                    return [2 /*return*/, next(err_2)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getArticles = getArticles;
function addArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, intro, title, text, section, images, tags, subTitles, thumbnail, articleId_1, date, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    authId = req.query.authId;
                    _a = req.body, intro = _a.intro, title = _a.title, text = _a.text, section = _a.section, images = _a.images, tags = _a.tags, subTitles = _a.subTitles, thumbnail = _a.thumbnail;
                    title = String(title).trim();
                    intro = String(intro).trim();
                    text = String(text).trim();
                    articleId_1 = uuid_1.v4();
                    date = new Date();
                    // ______________________________ add article
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO articles (\n                article_id,\n                thumbnail,\n                intro,\n                title,\n                text,\n                section,\n                sub_titles,\n                created_by,\n                updated_by,\n                created_at,\n                updated_at\n            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)\n        ", [
                            articleId_1,
                            thumbnail.image_id,
                            intro,
                            title,
                            text,
                            section,
                            JSON.stringify(subTitles === null || subTitles === void 0 ? void 0 : subTitles.map(function (s) { return ({
                                sub_title_id: uuid_1.v4(),
                                sub_title: s.sub_title,
                            }); })),
                            authId,
                            authId,
                            date,
                            date,
                        ])];
                case 1:
                    // ______________________________ add article
                    _b.sent();
                    // ________________________________ images
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO article_image (\n                    article_id,\n                    image_id\n                ) VALUES %L\n                ", images.map(function (i) { return [articleId_1, i.image_id]; })))];
                case 2:
                    // ________________________________ images
                    _b.sent();
                    // ___________________________ tags
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO article_tag (\n                    article_id,\n                    tag_id\n                ) VALUES %L\n                ", tags.map(function (t) { return [articleId_1, t.tag_id]; })))];
                case 3:
                    // ___________________________ tags
                    _b.sent();
                    return [2 /*return*/, res.status(201).json("")];
                case 4:
                    err_3 = _b.sent();
                    return [2 /*return*/, next(err_3)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.addArticle = addArticle;
function editArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, articleId, _a, intro, title, text, section, images, tags, subTitles, thumbnail, date, info, delImgs, addImgs, _loop_1, _i, _b, image, _loop_2, _c, _d, image, delTags, addTags, _loop_3, _e, _f, tag, _loop_4, _g, _h, tag, err_4;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 11, , 12]);
                    authId = req.query.authId;
                    articleId = req.params.articleId;
                    _a = req.body, intro = _a.intro, title = _a.title, text = _a.text, section = _a.section, images = _a.images, tags = _a.tags, subTitles = _a.subTitles, thumbnail = _a.thumbnail;
                    title = String(title).trim();
                    intro = String(intro).trim();
                    text = String(text).trim();
                    date = new Date();
                    // ______________________________ edit article
                    return [4 /*yield*/, db_1.pool.query("\n                UPDATE articles \n                SET\n                    intro=$1,\n                    title=$2,\n                    text=$3,\n                    section=$4,\n                    sub_titles=$5,\n                    updated_by=$6,\n                    updated_at=$7,\n                    thumbnail=$8\n                WHERE article_id=$9\n                ", [
                            intro,
                            title,
                            text,
                            section,
                            JSON.stringify(subTitles === null || subTitles === void 0 ? void 0 : subTitles.map(function (s) { return ({
                                sub_title_id: uuid_1.v4(),
                                sub_title: s.sub_title,
                            }); })),
                            authId,
                            date,
                            thumbnail.image_id,
                            articleId,
                        ])];
                case 1:
                    // ______________________________ edit article
                    _j.sent();
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,\n                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images\n            FROM articles a\n                LEFT JOIN users cb ON cb.user_id=a.created_by\n                LEFT JOIN users ub ON ub.user_id=a.updated_by\n                LEFT JOIN sections s ON s.section_id=a.section\n                LEFT JOIN (\n                    SELECT\n                        nt.article_id,\n                        jsonb_build_object (\n                            'tag_id', t.tag_id,\n                            'tag_name', t.tag_name\n                        ) as tag\n                    FROM article_tag nt\n                        LEFT JOIN tags t ON t.tag_id=nt.tag_id\n                ) as t\n                    ON t.article_id=a.article_id\n                LEFT JOIN (\n                    SELECT\n                        ni.article_id,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM article_image ni\n                        LEFT JOIN images i ON i.image_id=ni.image_id\n                ) as i\n                    ON i.article_id=a.article_id\n            WHERE a.article_id=$1\n            GROUP BY a.article_id, cb.user_id, ub.user_id, s.section_id\n            ", [articleId])];
                case 2:
                    info = (_j.sent()).rows[0];
                    delImgs = [];
                    addImgs = [];
                    _loop_1 = function (image) {
                        var foundImg = info.images.find(function (i) { return i.image_id === image.image_id; });
                        if (!foundImg)
                            addImgs.push([articleId, image.image_id]);
                    };
                    // add / delete logic
                    for (_i = 0, _b = images; _i < _b.length; _i++) {
                        image = _b[_i];
                        _loop_1(image);
                    }
                    _loop_2 = function (image) {
                        var foundImg = images.find(function (i) { return i.image_id === image.image_id; });
                        if (!foundImg)
                            delImgs.push([articleId, image.image_id]);
                    };
                    for (_c = 0, _d = info.images; _c < _d.length; _c++) {
                        image = _d[_c];
                        _loop_2(image);
                    }
                    if (!addImgs.length) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO article_image (\n                    article_id,\n                    image_id\n                ) VALUES %L\n                ", addImgs))];
                case 3:
                    _j.sent();
                    _j.label = 4;
                case 4:
                    if (!delImgs.length) return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                DELETE FROM article_image WHERE (article_id, image_id) IN (%L)\n                ", delImgs))];
                case 5:
                    _j.sent();
                    _j.label = 6;
                case 6:
                    delTags = [];
                    addTags = [];
                    _loop_3 = function (tag) {
                        var foundTag = info.tags.find(function (t) { return t.tag_id === tag.tag_id; });
                        if (!foundTag)
                            addTags.push([articleId, tag.tag_id]);
                    };
                    // add / delete logic
                    for (_e = 0, _f = tags; _e < _f.length; _e++) {
                        tag = _f[_e];
                        _loop_3(tag);
                    }
                    _loop_4 = function (tag) {
                        var foundTag = tags.find(function (i) { return i.tag_id === tag.tag_id; });
                        if (!foundTag)
                            delTags.push([articleId, tag.tag_id]);
                    };
                    for (_g = 0, _h = info.tags; _g < _h.length; _g++) {
                        tag = _h[_g];
                        _loop_4(tag);
                    }
                    if (!addTags.length) return [3 /*break*/, 8];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO article_tag (\n                    article_id,\n                    tag_id\n                ) VALUES %L\n                ", addTags))];
                case 7:
                    _j.sent();
                    _j.label = 8;
                case 8:
                    if (!delTags.length) return [3 /*break*/, 10];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                DELETE FROM article_tag WHERE (article_id, tag_id) IN (%L)\n                ", delTags))];
                case 9:
                    _j.sent();
                    _j.label = 10;
                case 10: return [2 /*return*/, res.status(200).json("")];
                case 11:
                    err_4 = _j.sent();
                    return [2 /*return*/, next(err_4)];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.editArticle = editArticle;
function permanentlyDeleteArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var articleId, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    articleId = req.params.articleId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM articles WHERE article_id=$1", [
                            articleId,
                        ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully deleted article." })];
                case 2:
                    err_5 = _a.sent();
                    return [2 /*return*/, next(err_5)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.permanentlyDeleteArticle = permanentlyDeleteArticle;
function archiveArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var articleId, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    articleId = req.params.articleId;
                    return [4 /*yield*/, db_1.pool.query("UPDATE articles SET is_archived=true, is_published=false WHERE article_id=$1", [articleId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully arhived a article." })];
                case 2:
                    err_6 = _a.sent();
                    return [2 /*return*/, next(err_6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.archiveArticle = archiveArticle;
function publishArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var articleId, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    articleId = req.params.articleId;
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE articles\n            SET\n                is_published=true,\n                is_archived=false\n            WHERE article_id=$1\n            ", [articleId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully published a article." })];
                case 2:
                    err_7 = _a.sent();
                    return [2 /*return*/, next(err_7)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.publishArticle = publishArticle;
