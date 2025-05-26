import pkg from 'jsonwebtoken';
const { verify } = pkg;

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Directly verify the token (no Bearer prefix expected)
        const decoded = verify(token, "process.env.JWT_SECRET");
        console.log(decoded);
        if (!decoded || !decoded.id) {
            return res.status(400).json({ message: "Invalid token. Missing user details." });
        }

        req.user = { id: decoded.id };  // Attach user ID to request
        next();  // Proceed to the next middleware

    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid token or expired session." });
    }
};

export default authMiddleware;