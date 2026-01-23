const logger = require("../utils/logger");
const axios = require("axios");

function ensureSameUser(req, res, next) {
    if (!req.query.userId) {
        next();
        return;
    }
    const paramUserId = parseInt(req.query.userId);
    if (parseInt(req.user.sub) !== paramUserId) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
}

async function requestRole(req, res, next) {

    const requesterId = req.user.sub;
    logger.info(`Requester ID: ${requesterId}`);

    try {
        logger.info("Fetching user role for authorization check.");
        const response = await axios.get(`http://users-service:3003/users/${requesterId}`, {
        headers: {
            Authorization: req.headers.authorization
        }
        });
        logger.info("User role fetched successfully.");
        req.user.role = response.data.data.role;
    } catch (error) {
        logger.error(`Error in ensureUserIsAdmin middleware: ${error.message}`, error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { ensureSameUser, requestRole };