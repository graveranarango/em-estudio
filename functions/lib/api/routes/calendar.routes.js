"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendar_controller_1 = require("../controllers/calendar.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/events', auth_1.isAuthenticated, calendar_controller_1.getCalendarEvents);
exports.default = router;
//# sourceMappingURL=calendar.routes.js.map