"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const admin = require("firebase-admin");
const isAuthenticated = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const split = authorization.split('Bearer ');
    if (split.length !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const token = split[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.locals = Object.assign(Object.assign({}, res.locals), { uid: decodedToken.uid, role: decodedToken.role, email: decodedToken.email });
        return next();
    }
    catch (err) {
        console.error(`${err.code} -  ${err.message}`);
        return res.status(401).send({ message: 'Unauthorized' });
    }
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=auth.js.map