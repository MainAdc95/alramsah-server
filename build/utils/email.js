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
exports.sendSyncEmail = exports.sendAsyncEmail = void 0;
var nodemailer_1 = __importDefault(require("nodemailer"));
var config_1 = __importDefault(require("../config"));
var contactUsEmail = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: config_1.default.email.port,
    secure: config_1.default.email.secure,
    auth: {
        user: config_1.default.email.contact.email,
        pass: config_1.default.email.contact.password,
    },
});
var noreplyEmail = nodemailer_1.default.createTransport({
    host: config_1.default.email.host,
    port: config_1.default.email.port,
    secure: config_1.default.email.secure,
    auth: {
        user: config_1.default.email.noreply.email,
        pass: config_1.default.email.noreply.password,
    },
});
var getEmailTransport = function (type) {
    switch (type) {
        case "contact":
            return contactUsEmail;
        case "noreply":
            return noreplyEmail;
        default:
            return null;
    }
};
function sendAsyncEmail(type, html, subject, to) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var info, err_1;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                info = void 0;
                                return [4 /*yield*/, ((_a = getEmailTransport(type)) === null || _a === void 0 ? void 0 : _a.sendMail({
                                        to: to || config_1.default.email.info.email,
                                        from: config_1.default.email[type].email || config_1.default.email.backupEmail,
                                        subject: subject,
                                        html: html,
                                    }))];
                            case 1:
                                info = _b.sent();
                                return [2 /*return*/, resolve(info)];
                            case 2:
                                err_1 = _b.sent();
                                return [2 /*return*/, reject(err_1)];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.sendAsyncEmail = sendAsyncEmail;
function sendSyncEmail(type, subject, html, to) {
    var _a;
    (_a = getEmailTransport(type)) === null || _a === void 0 ? void 0 : _a.sendMail({
        from: config_1.default.email[type].email || config_1.default.email.backupEmail,
        to: to || config_1.default.email[type].email,
        subject: subject,
        html: html,
    }, function (err, success) { });
}
exports.sendSyncEmail = sendSyncEmail;