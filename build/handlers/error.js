"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (err, req, res, next) {
    return res.status(err.status || 500).json({
        error: {
            status: err.status || 500,
            message: err.message || "Internal Server Error!",
        },
    });
});
