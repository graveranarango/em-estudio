"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utils_controller_1 = require("../controllers/utils.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/recursive-delete', auth_1.isAuthenticated, utils_controller_1.recursiveDelete);
exports.default = router;
//# sourceMappingURL=utils.routes.js.map