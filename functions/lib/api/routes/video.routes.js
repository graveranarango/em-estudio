"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const video_controller_1 = require("../controllers/video.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.isAuthenticated, video_controller_1.generateVideo);
exports.default = router;
//# sourceMappingURL=video.routes.js.map