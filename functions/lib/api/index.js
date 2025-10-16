"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiV1 = void 0;
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const threads_routes_1 = require("./routes/threads.routes");
const image_routes_1 = require("./routes/image.routes");
const app = express();
app.use(cors({ origin: true }));
app.use('/threads', threads_routes_1.default); // Mount thread routes under /threads
app.use('/image', image_routes_1.default); // Mount image routes under /image
exports.apiV1 = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map