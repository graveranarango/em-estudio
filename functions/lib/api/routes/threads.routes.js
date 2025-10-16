"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const threads_controller_1 = require("../controllers/threads.controller");
const router = (0, express_1.Router)();
// Thread routes
router.get('/listThreads', auth_1.isAuthenticated, threads_controller_1.listThreads);
router.post('/createThread', auth_1.isAuthenticated, threads_controller_1.createThread);
router.post('/renameThread', auth_1.isAuthenticated, threads_controller_1.renameThread);
router.post('/deleteThread', auth_1.isAuthenticated, threads_controller_1.deleteThread);
// Branch routes
router.post('/createBranch', auth_1.isAuthenticated, threads_controller_1.createBranch);
router.post('/renameBranch', auth_1.isAuthenticated, threads_controller_1.renameBranch);
router.post('/deleteBranch', auth_1.isAuthenticated, threads_controller_1.deleteBranch);
// These are not fully implemented in the controller, but we'll add the routes
router.post('/switchBranch', auth_1.isAuthenticated, threads_controller_1.switchBranch);
router.post('/branchFromMessage', auth_1.isAuthenticated, threads_controller_1.branchFromMessage);
exports.default = router;
//# sourceMappingURL=threads.routes.js.map