"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/data', auth_1.isAuthenticated, dashboard_controller_1.getDashboardData);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map