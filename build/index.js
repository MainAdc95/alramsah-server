"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
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
// server setup
var app = express_1.default();
var port = process.env.PORT || 5000;
// socket
var httpServer = require("http").Server(app);
app.disable("x-powered-by");
app.use(express_1.default.json({ limit: "50mb" }));
app.use(cookie_parser_1.default());
app.use(express_1.default.urlencoded({ extended: false }));
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
