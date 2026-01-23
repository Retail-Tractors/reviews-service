const jose = require("jose");
const logger = require("../utils/logger");
require("dotenv").config();

// JWT do User Service (RS256)
const USER_JWKS_URL = new URL(process.env.JWKS_URL);
const jwks = jose.createRemoteJWKSet(USER_JWKS_URL);

async function authenticateUserToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "User token missing." });

    const { payload } = await jose.jwtVerify(token, jwks, {
        issuer: 'retail-tractors-users-service',
        audience: 'retail-tractors-users',
        algorithms: ['RS256'],
    });
    req.user = payload;
    next();
}

module.exports = { authenticateUserToken };