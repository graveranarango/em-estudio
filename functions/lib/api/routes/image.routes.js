"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const image_controller_1 = require("../controllers/image.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.isAuthenticated, image_controller_1.generateImage);
exports.default = router;
//# sourceMappingURL=image.routes.js.map