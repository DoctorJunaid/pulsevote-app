// ==================== AUTHENTICATION MIDDLEWARE (auth.js) ====================
// Protects private API endpoints by extracting and verifying JWT tokens from incoming requests.

import jwt from "jsonwebtoken";

/**
 * AUTHENTICATION GUARD MIDDLEWARE
 * Logic:
 * - Checks both HTTP cookies (`req.cookies.token`) and standard HTTP Authorization headers (`Bearer <token>`).
 * - Returns 401 Unauthorized if no token is presented in the request.
 * - Decodes and verifies token signature using the secret key (`JWT_SECRET`).
 * - Attaches extracted user ID to `req.userId` for consumption in downstream controller actions.
 * - If token verification fails (expired/malformed), responds with HTTP 401 Unauthorized.
 */
export const protect = (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Attaches authenticated user ID to request object
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};