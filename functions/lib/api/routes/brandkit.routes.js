"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brandkit_controller_1 = require("../controllers/brandkit.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/get', auth_1.isAuthenticated, brandkit_controller_1.getBrandKit);
router.post('/update', auth_1.isAuthenticated, brandkit_controller_1.updateBrandKit);
exports.default = router;
//# sourceMappingURL=brandkit.routes.js.map