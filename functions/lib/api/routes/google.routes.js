"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_controller_1 = require("../controllers/google.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// This route generates the URL the user will visit to authorize the app
router.get('/auth/url', auth_1.isAuthenticated, google_controller_1.getAuthUrl);
// This is the callback route Google will redirect to after the user gives consent
router.get('/auth/callback', google_controller_1.handleAuthCallback);
exports.default = router;
//# sourceMappingURL=google.routes.js.map