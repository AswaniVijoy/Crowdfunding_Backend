import jwt from 'jsonwebtoken';

function authenticate(req, res, next) {
    try {
        const cookie = req.headers.cookie;
        if (cookie) {
            const [name, token] = cookie.trim().split('=');
            if (name == 'authToken') {
                const decode = jwt.verify(token, process.env.SECRET_KEY)
                req.name = decode.UserName
                req.role = decode.UserRole
                next();
            }
            else {
                res.status(401).json({ msg: 'Unauthorized acess' })
            }
        }
        else {
            res.status(404).json({ msg: 'Cookie not found' })
        }
    }
    catch (error) {
        console.error(error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired. Please login again.' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token' });
        }

        return res.status(500).json({ msg: 'Authentication failed' });
    }
}

export { authenticate }