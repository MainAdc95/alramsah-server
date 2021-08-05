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
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var rss_parser_1 = __importDefault(require("rss-parser"));
var axios_1 = __importDefault(require("axios"));
// handlers
var error_1 = __importDefault(require("./handlers/error"));
// importing routes
var privacyPolicy_1 = __importDefault(require("./routes/privacyPolicy"));
var auth_1 = __importDefault(require("./routes/auth"));
var user_1 = __importDefault(require("./routes/user"));
var image_1 = __importDefault(require("./routes/image"));
var userImage_1 = __importDefault(require("./routes/userImage"));
var section_1 = __importDefault(require("./routes/section"));
var tag_1 = __importDefault(require("./routes/tag"));
var news_1 = __importDefault(require("./routes/news"));
var message_1 = __importDefault(require("./routes/message"));
var article_1 = __importDefault(require("./routes/article"));
var strip_1 = __importDefault(require("./routes/strip"));
var file_1 = __importDefault(require("./routes/file"));
var poll_1 = __importDefault(require("./routes/poll"));
var newsLetter_1 = __importDefault(require("./routes/newsLetter"));
var visitor_1 = __importDefault(require("./routes/visitor"));
var db_1 = require("./utils/db");
// server setup
var app = express_1.default();
var port = process.env.PORT || 5000;
// socket
var httpServer = require("http").Server(app);
app.disable("x-powered-by");
app.use(express_1.default.json({ limit: "50mb" }));
app.use(cookie_parser_1.default());
app.use(express_1.default.urlencoded({ extended: false }));
app.set("trust proxy", true);
var blackList = [];
var corsOptions = {
    origin: function (origin, callback) {
        if (blackList.includes(origin))
            callback(Error("You are banned from this server!"));
        callback(null, true);
    },
    credentials: true,
};
app.use(cors_1.default(corsOptions));
// routes
app.use("/api", auth_1.default);
app.use("/api", user_1.default);
app.use("/api", privacyPolicy_1.default);
app.use("/api", userImage_1.default);
app.use("/api", image_1.default);
app.use("/api", news_1.default);
app.use("/api", section_1.default);
app.use("/api", tag_1.default);
app.use("/api", message_1.default);
app.use("/api", article_1.default);
app.use("/api", strip_1.default);
app.use("/api", file_1.default);
app.use("/api", poll_1.default);
app.use("/api", newsLetter_1.default);
app.use("/api", visitor_1.default);
var parser = new rss_parser_1.default();
app.post("/api/rss", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var url, data, feed, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                url = req.body.url;
                return [4 /*yield*/, axios_1.default.get(url)];
            case 1:
                data = _a.sent();
                return [4 /*yield*/, parser.parseString(data.data)];
            case 2:
                feed = _a.sent();
                return [2 /*return*/, res.status(200).json(feed)];
            case 3:
                err_1 = _a.sent();
                return [2 /*return*/, next(err_1)];
            case 4: return [2 /*return*/];
        }
    });
}); });
var createReaders = function () { return __awaiter(void 0, void 0, void 0, function () {
    var news, articles, _i, news_2, item, min, max, readers, _a, articles_1, item, min, max, readers;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db_1.pool.query("SELECT * FROM news")];
            case 1:
                news = (_b.sent()).rows;
                return [4 /*yield*/, db_1.pool.query("SELECT * FROM articles")];
            case 2:
                articles = (_b.sent()).rows;
                _i = 0, news_2 = news;
                _b.label = 3;
            case 3:
                if (!(_i < news_2.length)) return [3 /*break*/, 6];
                item = news_2[_i];
                min = 2500;
                max = 15000;
                readers = Math.floor(Math.random() * (max - min + 1)) + min;
                console.log("DSF");
                return [4 /*yield*/, db_1.pool.query("UPDATE news SET readers=$1 WHERE news_id=$2", [
                        readers,
                        item.news_id,
                    ])];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                _a = 0, articles_1 = articles;
                _b.label = 7;
            case 7:
                if (!(_a < articles_1.length)) return [3 /*break*/, 10];
                item = articles_1[_a];
                min = 1;
                max = 15000;
                readers = Math.floor(Math.random() * (max - min + 1)) + min;
                return [4 /*yield*/, db_1.pool.query("UPDATE articles SET readers=$1 WHERE article_id=$2", [
                        readers,
                        item.article_id,
                    ])];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9:
                _a++;
                return [3 /*break*/, 7];
            case 10: return [2 /*return*/];
        }
    });
}); };
createReaders();
// 404 route
app.use(function (req, res, next) {
    var err = new Error("route not found.");
    err.status = 404;
    next(err);
});
// error handler
app.use(error_1.default);
// start server
httpServer.listen(port, function () { return console.log("server started at port " + port + "!!!"); });
