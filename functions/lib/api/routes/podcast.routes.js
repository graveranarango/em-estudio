"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const podcast_controller_1 = require("../controllers/podcast.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.isAuthenticated, podcast_controller_1.generatePodcast);
exports.default = router;
//# sourceMappingURL=podcast.routes.js.map