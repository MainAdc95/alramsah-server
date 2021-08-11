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
exports.getStatistics = exports.homeInfo = exports.read = exports.publishNews = exports.archiveNews = exports.permanentlyDeleteNews = exports.transformToArticle = exports.editNews = exports.addNews = exports.getAllNews = exports.getNews = void 0;
var db_1 = require("../utils/db");
var uuid_1 = require("uuid");
var pg_format_1 = __importDefault(require("pg-format"));
var google_1 = require("../utils/google");
var newsQuery = function (isAdmin, filter, order, limit, offset) { return "\n            SELECT\n                n.news_id,\n                n.title,\n                n.readers,\n                is_archived,\n                " + (isAdmin ? "n.updated_at," : "") + "\n                n.created_at,\n                " + (!isAdmin
    ? ""
    : "jsonb_build_object (\n                    'user_id', cb.user_id,\n                    'username', cb.username\n                ) as created_by,\n                jsonb_build_object (\n                    'user_id', ub.user_id,\n                    'username', ub.username\n                ) as updated_by,") + "\n                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,\n                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (\n                    'section_id', s.section_id,\n                    'section_name', s.section_name,\n                    'color', s.color\n                ) END as section,\n                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (\n                    'image_id', tn.image_id,\n                    'sizes', tn.sizes\n                ) END as thumbnail\n            FROM news n\n                LEFT JOIN users cb ON cb.user_id=n.created_by\n                LEFT JOIN users ub ON ub.user_id=n.updated_by\n                LEFT JOIN sections s ON s.section_id=n.section\n                LEFT JOIN images tn ON tn.image_id=n.thumbnail\n                LEFT JOIN (\n                    SELECT\n                        ni.news_id,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM news_image ni\n                        LEFT JOIN images i ON i.image_id=ni.image_id\n                ) as i\n                    ON i.news_id=n.news_id\n            " + (filter || "") + "\n            GROUP BY n.news_id, " + (!isAdmin ? "" : "cb.user_id, ub.user_id,") + " s.section_id, tn.image_id\n            " + (order || "ORDER BY n.created_at desc") + "\n            " + (limit || "LIMIT 100") + "\n            " + (offset || "") + "\n        "; };
function getNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var newsId, news, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    newsId = req.params.newsId;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                n.news_id,\n                n.intro,\n                n.title,\n                n.text,\n                n.readers,\n                n.sub_titles,\n                n.resources,\n                n.is_archived,\n                n.thumbnail_description,\n                n.updated_at,\n                n.created_at,\n                n.is_published,\n                jsonb_build_object (\n                    'user_id', cb.user_id,\n                    'username', cb.username\n                ) as created_by,\n                jsonb_build_object (\n                    'user_id', ub.user_id,\n                    'username', ub.username\n                ) as updated_by,\n                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,\n                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,\n                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (\n                    'section_id', s.section_id,\n                    'section_name', s.section_name,\n                    'color', s.color\n                ) END as section,\n                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (\n                    'image_id', tn.image_id,\n                    'image_description', tn.image_description,\n                    'sizes', tn.sizes\n                ) END as thumbnail,\n                CASE WHEN COUNT(f)=0 THEN null ELSE jsonb_build_object (\n                    'file_id', f.file_id,\n                    'text', f.text,\n                    'image', f.image\n                ) END as file\n            FROM news n\n                LEFT JOIN users cb ON cb.user_id=n.created_by\n                LEFT JOIN users ub ON ub.user_id=n.updated_by\n                LEFT JOIN sections s ON s.section_id=n.section\n                LEFT JOIN images tn ON tn.image_id=n.thumbnail\n                LEFT JOIN (\n                    SELECT\n                        f.file_id,\n                        f.text,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'image_description', i.image_description,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM files f\n                        LEFT JOIN images i ON i.image_id=f.image_id\n                ) as f\n                    ON f.file_id=n.file\n                LEFT JOIN (\n                    SELECT\n                        nt.news_id,\n                        jsonb_build_object (\n                            'tag_id', t.tag_id,\n                            'tag_name', t.tag_name\n                        ) as tag\n                    FROM news_tag nt\n                        LEFT JOIN tags t ON t.tag_id=nt.tag_id\n                ) as t\n                    ON t.news_id=n.news_id\n                LEFT JOIN (\n                    SELECT\n                        ni.news_id,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM news_image ni\n                        LEFT JOIN images i ON i.image_id=ni.image_id\n                ) as i\n                    ON i.news_id=n.news_id\n            WHERE n.news_id=$1\n            GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id, tn.image_id, f.file_id, f.text, f.image\n            ", [newsId])];
                case 1:
                    news = (_a.sent()).rows[0];
                    return [2 /*return*/, res.status(200).json(news)];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, next(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getNews = getNews;
var sum = function (times, value) {
    var totalValue = 0;
    for (var i = 0; i < times; i++) {
        totalValue += value;
    }
    return totalValue - value;
};
function getAllNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, p, r, type, sectionId, tag, mvn, newsId, fileId, text, isAdmin, order, count, news, err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.query, p = _a.p, r = _a.r, type = _a.type, sectionId = _a.sectionId, tag = _a.tag, mvn = _a.mvn, newsId = _a.newsId, fileId = _a.fileId, text = _a.text, isAdmin = _a.isAdmin, order = _a.order;
                    p = Number(p);
                    r = r ? Number(r) : 20;
                    return [4 /*yield*/, db_1.pool.query("SELECT count(*) FROM news n WHERE \n            " + (tag
                            ? "n.news_id IN (select news_id from news_tag WHERE tag_id='" + tag + "') AND"
                            : "") + "\n            is_published=" + (type === "published" ? true : false) + " AND\n            is_archived=" + (type === "archived" ? true : false) + "\n            " + (sectionId ? "AND section='" + sectionId + "'" : "") + "\n            " + (fileId ? "AND file='" + fileId + "'" : "") + "\n            " + (text ? "AND n.title LIKE '%" + text + "%'" : "") + "\n            ")];
                case 1:
                    count = (_b.sent()).rows[0].count;
                    count = Number(count);
                    return [4 /*yield*/, db_1.pool.query(newsQuery(isAdmin ? true : false, p
                            ? "WHERE\n                    " + (fileId ? "n.file='" + fileId + "' AND" : "") + "\n                    " + (text ? "n.title LIKE '%" + text + "%' AND" : "") + "\n                    " + (sectionId ? "n.section='" + sectionId + "' AND" : "") + "\n                    " + (tag
                                ? "n.news_id IN (select news_id from news_tag WHERE tag_id='" + tag + "') AND"
                                : "") + "\n                    " + (newsId ? "n.news_id != '" + newsId + "' AND" : "") + "\n                    is_published=" + (type === "published" ? true : false) + " AND\n                    is_archived=" + (type === "archived" ? true : false) + "\n                    "
                            : "", mvn
                            ? "ORDER BY n.readers desc"
                            : "ORDER BY  n.created_at " + (order || "desc"), r ? "LIMIT " + r : "", "OFFSET " + sum(p, r)))];
                case 2:
                    news = (_b.sent()).rows;
                    return [2 /*return*/, res.status(200).json({
                            results: count,
                            news: news,
                        })];
                case 3:
                    err_2 = _b.sent();
                    return [2 /*return*/, next(err_2)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getAllNews = getAllNews;
function addNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, _a, intro, title, text, section, file, images, tags, subTitles, resources, thumbnail, is_published, thumbnail_description, newsId_1, date, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    authId = req.query.authId;
                    _a = req.body, intro = _a.intro, title = _a.title, text = _a.text, section = _a.section, file = _a.file, images = _a.images, tags = _a.tags, subTitles = _a.subTitles, resources = _a.resources, thumbnail = _a.thumbnail, is_published = _a.is_published, thumbnail_description = _a.thumbnail_description;
                    title = String(title).trim();
                    intro = String(intro).trim();
                    text = String(text).trim();
                    newsId_1 = uuid_1.v4();
                    date = new Date();
                    // ______________________________ add news
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO news (\n                " + (thumbnail ? "thumbnail, " : "") + "\n                news_id,\n                intro,\n                title,\n                text,\n                sub_titles,\n                resources,\n                created_by,\n                updated_by,\n                created_at,\n                updated_at,\n                is_published,\n                thumbnail_description,\n                published_at\n                " + (section ? ", section" : "") + "\n                " + (file ? ", file" : "") + "\n            ) VALUES (" + (thumbnail ? "'" + thumbnail.image_id + "'," : "") + " $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13\n            " + (section ? ", '" + section + "'" : "") + "\n            " + (file ? ", '" + file + "'" : "") + "\n            )\n        ", [
                            newsId_1,
                            intro,
                            title,
                            text,
                            JSON.stringify((subTitles === null || subTitles === void 0 ? void 0 : subTitles.length)
                                ? subTitles === null || subTitles === void 0 ? void 0 : subTitles.map(function (s) { return ({
                                    sub_title_id: uuid_1.v4(),
                                    sub_title: s.sub_title,
                                }); })
                                : []),
                            JSON.stringify((resources === null || resources === void 0 ? void 0 : resources.length)
                                ? resources === null || resources === void 0 ? void 0 : resources.map(function (r) { return ({
                                    resource_id: uuid_1.v4(),
                                    resource: r.resource,
                                }); })
                                : []),
                            authId,
                            authId,
                            date,
                            date,
                            is_published,
                            thumbnail_description,
                            is_published ? date : null,
                        ])];
                case 1:
                    // ______________________________ add news
                    _b.sent();
                    if (!(images === null || images === void 0 ? void 0 : images.length)) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO news_image (\n                    news_id,\n                    image_id\n                ) VALUES %L\n                ", images.map(function (i) { return [newsId_1, i.image_id]; })))];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    if (!(tags === null || tags === void 0 ? void 0 : tags.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO news_tag (\n                    news_id,\n                    tag_id\n                ) VALUES %L\n                ", tags.map(function (t) { return [newsId_1, t.tag_id]; })))];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/, res.status(201).json("")];
                case 6:
                    err_3 = _b.sent();
                    return [2 /*return*/, next(err_3)];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.addNews = addNews;
function editNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, newsId, _a, intro, title, text, section, file, images, tags, subTitles, resources, thumbnail, thumbnail_description, date, info, delImgs, addImgs, _loop_1, _i, _b, image, _loop_2, _c, _d, image, delTags, addTags, _loop_3, _e, _f, tag, _loop_4, _g, _h, tag, err_4;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 11, , 12]);
                    authId = req.query.authId;
                    newsId = req.params.newsId;
                    _a = req.body, intro = _a.intro, title = _a.title, text = _a.text, section = _a.section, file = _a.file, images = _a.images, tags = _a.tags, subTitles = _a.subTitles, resources = _a.resources, thumbnail = _a.thumbnail, thumbnail_description = _a.thumbnail_description;
                    title = String(title).trim();
                    intro = String(intro).trim();
                    text = String(text).trim();
                    date = new Date();
                    // ______________________________ edit news
                    return [4 /*yield*/, db_1.pool.query("\n                UPDATE news \n                SET\n                    intro=$1,\n                    title=$2,\n                    text=$3,\n                    sub_titles=$4,\n                    updated_by=$5,\n                    updated_at=$6,\n                    resources=$7,\n                    thumbnail_description=$8\n                    " + (section ? ", section='" + section + "'" : "") + "\n                    " + (thumbnail
                            ? ", thumbnail='" + thumbnail.image_id + "'"
                            : ", thumbnail=null") + "\n                    " + (file ? ", file='" + file + "'" : "") + "\n                WHERE news_id=$9\n                ", [
                            intro,
                            title,
                            text,
                            JSON.stringify((subTitles === null || subTitles === void 0 ? void 0 : subTitles.length)
                                ? subTitles === null || subTitles === void 0 ? void 0 : subTitles.map(function (s) { return ({
                                    sub_title_id: uuid_1.v4(),
                                    sub_title: s.sub_title,
                                }); })
                                : []),
                            authId,
                            date,
                            JSON.stringify((resources === null || resources === void 0 ? void 0 : resources.length)
                                ? resources === null || resources === void 0 ? void 0 : resources.map(function (r) { return ({
                                    resource_id: uuid_1.v4(),
                                    resource: r.resource,
                                }); })
                                : []),
                            thumbnail_description,
                            newsId,
                        ])];
                case 1:
                    // ______________________________ edit news
                    _j.sent();
                    return [4 /*yield*/, db_1.pool.query("\n                SELECT\n                    CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,\n                    CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images\n                FROM news n\n                    LEFT JOIN users cb ON cb.user_id=n.created_by\n                    LEFT JOIN users ub ON ub.user_id=n.updated_by\n                    LEFT JOIN sections s ON s.section_id=n.section\n                    LEFT JOIN (\n                        SELECT\n                            nt.news_id,\n                            jsonb_build_object (\n                                'tag_id', t.tag_id,\n                                'tag_name', t.tag_name\n                            ) as tag\n                        FROM news_tag nt\n                            LEFT JOIN tags t ON t.tag_id=nt.tag_id\n                    ) as t\n                        ON t.news_id=n.news_id\n                    LEFT JOIN (\n                        SELECT\n                            ni.news_id,\n                            jsonb_build_object (\n                                'image_id', i.image_id,\n                                'sizes', i.sizes\n                            ) as image\n                        FROM news_image ni\n                            LEFT JOIN images i ON i.image_id=ni.image_id\n                    ) as i\n                        ON i.news_id=n.news_id\n                WHERE n.news_id=$1\n                GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id\n                ", [newsId])];
                case 2:
                    info = (_j.sent()).rows[0];
                    delImgs = [];
                    addImgs = [];
                    _loop_1 = function (image) {
                        var foundImg = info.images.find(function (i) { return i.image_id === image.image_id; });
                        if (!foundImg)
                            addImgs.push([newsId, image.image_id]);
                    };
                    // add / delete logic
                    for (_i = 0, _b = images; _i < _b.length; _i++) {
                        image = _b[_i];
                        _loop_1(image);
                    }
                    _loop_2 = function (image) {
                        var foundImg = images.find(function (i) { return i.image_id === image.image_id; });
                        if (!foundImg)
                            delImgs.push([newsId, image.image_id]);
                    };
                    for (_c = 0, _d = info.images; _c < _d.length; _c++) {
                        image = _d[_c];
                        _loop_2(image);
                    }
                    if (!addImgs.length) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                        INSERT INTO news_image (\n                            news_id,\n                            image_id\n                        ) VALUES %L\n                        ", addImgs))];
                case 3:
                    _j.sent();
                    _j.label = 4;
                case 4:
                    if (!delImgs.length) return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                        DELETE FROM news_image WHERE (news_id, image_id) IN (%L)\n                        ", delImgs))];
                case 5:
                    _j.sent();
                    _j.label = 6;
                case 6:
                    delTags = [];
                    addTags = [];
                    _loop_3 = function (tag) {
                        var foundTag = info.tags.find(function (t) { return t.tag_id === tag.tag_id; });
                        if (!foundTag)
                            addTags.push([newsId, tag.tag_id]);
                    };
                    // add / delete logic
                    for (_e = 0, _f = tags; _e < _f.length; _e++) {
                        tag = _f[_e];
                        _loop_3(tag);
                    }
                    _loop_4 = function (tag) {
                        var foundTag = tags.find(function (i) { return i.tag_id === tag.tag_id; });
                        if (!foundTag)
                            delTags.push([newsId, tag.tag_id]);
                    };
                    for (_g = 0, _h = info.tags; _g < _h.length; _g++) {
                        tag = _h[_g];
                        _loop_4(tag);
                    }
                    if (!addTags.length) return [3 /*break*/, 8];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                        INSERT INTO news_tag (\n                            news_id,\n                            tag_id\n                        ) VALUES %L\n                        ", addTags))];
                case 7:
                    _j.sent();
                    _j.label = 8;
                case 8:
                    if (!delTags.length) return [3 /*break*/, 10];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                        DELETE FROM news_tag WHERE (news_id, tag_id) IN (%L)\n                        ", delTags))];
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
exports.editNews = editNews;
function transformToArticle(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var authId, newsId, news, intro, title, text, images, tags, subTitles, thumbnail, is_published, created_at, articleId_1, date, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    authId = req.query.authId;
                    newsId = req.params.newsId;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                n.news_id,\n                n.intro,\n                n.title,\n                n.text,\n                n.readers,\n                n.sub_titles,\n                n.resources,\n                n.is_archived,\n                n.thumbnail_description,\n                n.updated_at,\n                n.created_at,\n                n.is_published,\n                jsonb_build_object (\n                    'user_id', cb.user_id,\n                    'username', cb.username\n                ) as created_by,\n                jsonb_build_object (\n                    'user_id', ub.user_id,\n                    'username', ub.username\n                ) as updated_by,\n                CASE WHEN COUNT(t)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT t.tag) END as tags,\n                CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,\n                CASE WHEN COUNT(s)=0 THEN null ELSE jsonb_build_object (\n                    'section_id', s.section_id,\n                    'section_name', s.section_name,\n                    'color', s.color\n                ) END as section,\n                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (\n                    'image_id', tn.image_id,\n                    'image_description', tn.image_description,\n                    'sizes', tn.sizes\n                ) END as thumbnail,\n                CASE WHEN COUNT(f)=0 THEN null ELSE jsonb_build_object (\n                    'file_id', f.file_id,\n                    'text', f.text,\n                    'image', f.image\n                ) END as file\n            FROM news n\n                LEFT JOIN users cb ON cb.user_id=n.created_by\n                LEFT JOIN users ub ON ub.user_id=n.updated_by\n                LEFT JOIN sections s ON s.section_id=n.section\n                LEFT JOIN images tn ON tn.image_id=n.thumbnail\n                LEFT JOIN (\n                    SELECT\n                        f.file_id,\n                        f.text,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'image_description', i.image_description,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM files f\n                        LEFT JOIN images i ON i.image_id=f.image_id\n                ) as f\n                    ON f.file_id=n.file\n                LEFT JOIN (\n                    SELECT\n                        nt.news_id,\n                        jsonb_build_object (\n                            'tag_id', t.tag_id,\n                            'tag_name', t.tag_name\n                        ) as tag\n                    FROM news_tag nt\n                        LEFT JOIN tags t ON t.tag_id=nt.tag_id\n                ) as t\n                    ON t.news_id=n.news_id\n                LEFT JOIN (\n                    SELECT\n                        ni.news_id,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM news_image ni\n                        LEFT JOIN images i ON i.image_id=ni.image_id\n                ) as i\n                    ON i.news_id=n.news_id\n            WHERE n.news_id=$1\n            GROUP BY n.news_id, cb.user_id, ub.user_id, s.section_id, tn.image_id, f.file_id, f.text, f.image\n            ", [newsId])];
                case 1:
                    news = (_a.sent()).rows[0];
                    intro = news.intro, title = news.title, text = news.text, images = news.images, tags = news.tags, subTitles = news.subTitles, thumbnail = news.thumbnail, is_published = news.is_published, created_at = news.created_at;
                    articleId_1 = uuid_1.v4();
                    date = new Date();
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO articles (\n                " + (thumbnail ? "thumbnail, " : "") + "\n                article_id,\n                intro,\n                title,\n                text,\n                sub_titles,\n                created_by,\n                updated_by,\n                created_at,\n                updated_at,\n                is_published\n            ) VALUES (" + (thumbnail ? "'" + thumbnail.image_id + "'," : "") + " $1, $2, $3, $4, $5, $6, $7, $8, $9, $10\n            )\n        ", [
                            articleId_1,
                            intro,
                            title,
                            text,
                            JSON.stringify(subTitles || []),
                            authId,
                            authId,
                            created_at,
                            date,
                            is_published,
                        ])];
                case 2:
                    _a.sent();
                    if (!(images === null || images === void 0 ? void 0 : images.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n                INSERT INTO article_image (\n                    article_id,\n                    image_id\n                ) VALUES %L\n                ", images.map(function (i) { return [articleId_1, i.image_id]; })))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (!(tags === null || tags === void 0 ? void 0 : tags.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.pool.query(pg_format_1.default("\n            INSERT INTO article_tag (\n                article_id,\n                tag_id\n            ) VALUES %L\n            ", tags.map(function (t) { return [articleId_1, t.tag_id]; })))];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, db_1.pool.query("DELETE FROM news WHERE news_id=$1", [newsId])];
                case 7:
                    _a.sent();
                    return [2 /*return*/, res.status(201).json("")];
                case 8:
                    err_5 = _a.sent();
                    return [2 /*return*/, next(err_5)];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.transformToArticle = transformToArticle;
function permanentlyDeleteNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var newsId, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    newsId = req.params.newsId;
                    return [4 /*yield*/, db_1.pool.query("DELETE FROM news WHERE news_id=$1", [newsId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully deleted news." })];
                case 2:
                    err_6 = _a.sent();
                    return [2 /*return*/, next(err_6)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.permanentlyDeleteNews = permanentlyDeleteNews;
function archiveNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var newsId, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    newsId = req.params.newsId;
                    return [4 /*yield*/, db_1.pool.query("UPDATE news SET is_archived=true, is_published=false WHERE news_id=$1", [newsId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully arhived a news." })];
                case 2:
                    err_7 = _a.sent();
                    return [2 /*return*/, next(err_7)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.archiveNews = archiveNews;
function publishNews(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var newsId, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    newsId = req.params.newsId;
                    return [4 /*yield*/, db_1.pool.query("\n            UPDATE news\n            SET\n                is_published=true,\n                is_archived=false,\n                published_at=$1\n            WHERE news_id=$2\n            ", [new Date(), newsId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, res
                            .status(200)
                            .json({ message: "You have successfully published a news." })];
                case 2:
                    err_8 = _a.sent();
                    return [2 /*return*/, next(err_8)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.publishNews = publishNews;
function read(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, newsId, articleId, sectionId, viewId, date, viewType, err_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = req.body, newsId = _a.newsId, articleId = _a.articleId, sectionId = _a.sectionId;
                    viewId = uuid_1.v4();
                    date = new Date();
                    viewType = newsId ? "news" : "article";
                    return [4 /*yield*/, db_1.pool.query("\n            INSERT INTO views (\n                view_id,\n                view_type,\n                news_id,\n                article_id,\n                section_id,\n                created_at\n            ) VALUES ($1, $2, $3, $4, $5, $6)\n            ", [viewId, viewType, newsId, articleId, sectionId, date])];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json("")];
                case 2:
                    err_9 = _b.sent();
                    return [2 /*return*/, next(err_9)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.read = read;
function homeInfo(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var sections, _i, sections_1, section, news, strips, files, tmrNews, article, err_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                s.section_id,\n                s.section_name,\n                s.color,\n                s.created_at,\n                s.section_order\n            FROM sections s\n            ORDER BY s.section_order ASC\n            ")];
                case 1:
                    sections = (_a.sent()).rows;
                    _i = 0, sections_1 = sections;
                    _a.label = 2;
                case 2:
                    if (!(_i < sections_1.length)) return [3 /*break*/, 5];
                    section = sections_1[_i];
                    return [4 /*yield*/, db_1.pool.query("\n                SELECT\n                        n.news_id,\n                        n.intro,\n                        n.section,\n                        n.title,\n                        n.created_at,\n                        n.is_published,\n                        CASE WHEN COUNT(i)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT i.image) END as images,\n                        CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (\n                            'image_id', tn.image_id,\n                            'sizes', tn.sizes\n                        ) END as thumbnail\n                    FROM news n\n                        LEFT JOIN images tn ON tn.image_id=n.thumbnail\n                        LEFT JOIN (\n                            SELECT\n                                ni.news_id,\n                                jsonb_build_object (\n                                    'image_id', i.image_id,\n                                    'sizes', i.sizes\n                                ) as image\n                            FROM news_image ni\n                                LEFT JOIN images i ON i.image_id=ni.image_id\n                        ) as i\n                            ON i.news_id=n.news_id\n                    WHERE n.is_published=true AND n.section=$1\n                    GROUP BY n.news_id, tn.image_id\n                    ORDER BY n.created_at desc\n                    LIMIT " + (section.section_name === "سياسة" ? 10 : 1) + "\n                ", [section.section_id])];
                case 3:
                    news = (_a.sent()).rows;
                    section.news = news;
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                s.strip_id,\n                s.title,\n                s.duration,\n                s.link,\n                s.type,\n                s.created_at\n            FROM strips s\n            ")];
                case 6:
                    strips = (_a.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                f.file_id,\n                f.text,\n                f.created_at,\n                jsonb_build_object (\n                    'image_id', i.image_id,\n                    'sizes', i.sizes\n                ) as image\n            FROM files f\n                LEFT JOIN images i ON i.image_id=f.image_id\n            WHERE is_active=true\n            ")];
                case 7:
                    files = (_a.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query(newsQuery(false, "WHERE n.created_at > now()::date - 7", "ORDER BY n.readers desc, n.created_by DESC", "LIMIT 10", ""))];
                case 8:
                    tmrNews = (_a.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                a.article_id,\n                a.title,\n                a.readers,\n                a.created_at,\n                jsonb_build_object (\n                    'user_id', cb.user_id,\n                    'username', cb.username,\n                    'avatar', cb.avatar\n                ) as created_by,\n                CASE WHEN COUNT(tn)=0 THEN null ELSE jsonb_build_object (\n                    'image_id', tn.image_id,\n                    'sizes', tn.sizes\n                ) END as thumbnail\n            FROM articles a\n                LEFT JOIN images tn ON tn.image_id=a.thumbnail\n                LEFT JOIN (\n                    SELECT\n                        u.user_id,\n                        u.username,\n                        jsonb_build_object (\n                            'image_id', ui.image_id,\n                            'sizes', ui.sizes\n                        ) as avatar\n                    FROM users u\n                        LEFT JOIN user_images ui ON ui.image_id=u.avatar\n                ) as cb\n                    ON cb.user_id=a.created_by\n                LEFT JOIN (\n                    SELECT\n                        ni.article_id,\n                        jsonb_build_object (\n                            'image_id', i.image_id,\n                            'sizes', i.sizes\n                        ) as image\n                    FROM article_image ni\n                        LEFT JOIN images i ON i.image_id=ni.image_id\n                ) as i\n                    ON i.article_id=a.article_id\n                WHERE a.is_published=true\n                GROUP BY a.article_id, cb.user_id, cb.username, cb.avatar, tn.image_id\n                ORDER BY a.created_at desc\n                LIMIT 1\n            ")];
                case 9:
                    article = (_a.sent()).rows[0];
                    return [2 /*return*/, res
                            .status(200)
                            .json({ sections: sections, strips: strips, files: files, tmrNews: tmrNews, article: article })];
                case 10:
                    err_10 = _a.sent();
                    return [2 /*return*/, next(err_10)];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.homeInfo = homeInfo;
function getStatistics(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var dataType, d, date, sections, views, news, trtD, trtNews, alrVisitors, latestNews, news24hr, _a, visitors, RealTimeVisitors, err_11;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    dataType = req.query.dataType;
                    d = new Date();
                    date = void 0;
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
                    date.setHours(-4);
                    date.setMinutes(0);
                    date.setSeconds(0);
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                s.section_id,\n                s.section_name,\n                s.color,\n                CASE WHEN COUNT(v)=0 THEN ARRAY[]::jsonb[] ELSE array_agg(\n                    jsonb_build_object (\n                        'created_at', v.created_at\n                    )\n                ) END as views\n            FROM sections s\n                LEFT JOIN (\n                    SELECT\n                        section_id,\n                        created_at\n                    FROM views\n                    WHERE created_at > $1\n                ) v\n                    ON v.section_id=s.section_id\n            GROUP BY s.section_id\n            ORDER BY s.created_at desc\n            ", [new Date(date)])];
                case 1:
                    sections = (_b.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query("\n                SELECT\n                    created_at\n                FROM views\n                WHERE created_at > $1\n                ORDER BY created_at desc\n            ", [new Date(date)])];
                case 2:
                    views = (_b.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                created_at\n            FROM news\n            WHERE is_published AND published_at > $1\n            ORDER BY published_at desc \n            ", [new Date(date)])];
                case 3:
                    news = (_b.sent()).rows;
                    trtD = new Date();
                    trtD.setHours(0);
                    trtD.setMinutes(0);
                    trtD.setSeconds(0);
                    console.log(trtD.toLocaleString());
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                count(*) as \"trtNews\"\n            FROM views\n            WHERE created_at > $1\n            ", [trtD])];
                case 4:
                    trtNews = (_b.sent()).rows[0].trtNews;
                    return [4 /*yield*/, db_1.pool.query("\n                SELECT\n                    visitor_id,\n                    user_data,\n                    created_at\n                FROM visitors\n                WHERE created_at > $1\n            ", [trtD])];
                case 5:
                    alrVisitors = (_b.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                n.news_id,\n                n.title,\n                COUNT(v) as views\n            FROM news n\n                LEFT JOIN views v ON n.news_id=v.news_id\n            WHERE is_published=true AND n.published_at > $1\n            GROUP BY n.news_id\n            ORDER BY views desc\n            LIMIT 10\n            ", [new Date(date)])];
                case 6:
                    latestNews = (_b.sent()).rows;
                    return [4 /*yield*/, db_1.pool.query("\n            SELECT\n                n.news_id,\n                n.title,\n                COUNT(v) as views\n            FROM news n\n                LEFT JOIN views v ON n.news_id=v.news_id\n            WHERE is_published=true AND n.published_at > $1\n            GROUP BY n.news_id\n            ORDER BY views desc\n            ", [trtD])];
                case 7:
                    news24hr = (_b.sent()).rows;
                    return [4 /*yield*/, google_1.runReport()];
                case 8:
                    _a = _b.sent(), visitors = _a.visitedCountries, RealTimeVisitors = _a.visitedCountriesRealtime;
                    return [2 /*return*/, res.status(200).json({
                            sections: sections,
                            views: views,
                            news: news,
                            latestNews: latestNews,
                            trtNews: trtNews,
                            news24hr: news24hr,
                            visitors: visitors.rows,
                            RealTimeVisitors: RealTimeVisitors.rows,
                            alrVisitors: alrVisitors,
                        })];
                case 9:
                    err_11 = _b.sent();
                    return [2 /*return*/, next(err_11)];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.getStatistics = getStatistics;
