import jwt from 'jsonwebtoken'

// User authentication middleware
const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
        }

        const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer '
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        

        req.user = { id: decoded.id }; // Attach decoded user ID to req.user
        
        next();

    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

export default authUser;