"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const competition_controller_1 = require("../controllers/competition.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/analyze', auth_1.isAuthenticated, competition_controller_1.analyzeCompetition);
exports.default = router;
//# sourceMappingURL=competition.routes.js.map