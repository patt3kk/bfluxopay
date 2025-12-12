const { config } = require("../config");
const { APIError } = require("./errorApi");
const jwt = require("jsonwebtoken");

// No need for manual cookie parsing since we're using cookie-parser middleware

exports.userRequired = (req,res,next) => {
    try{
        // Check for Authorization header with Bearer token first
        let token;
        const authHeader = req.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
        
        // If no Bearer token, check for cookie
        if (!token) {
            token = req.cookies?.bflux;
        }
        
        // Fallback to body token
        if(!token) token = req.body?.token;
        
        if(!token) return next(APIError.unauthenticated());
        const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        req.userId = payload.id;
        req.userEmail = payload.email;
        req.userRole = payload.role;
        req.userPhone = payload.phone; // Add user phone from JWT payload

        next()
    }catch(error){
        if(error.message === "jwt expired") next(APIError.unauthenticated("Access Token Expired"));
        else next(error);
    }
}


exports.adminRequired = (req,res,next) => {
    try{
        // Check for Authorization header with Bearer token first
        let token;
        const authHeader = req.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
        
        // If no Bearer token, check for cookie
        if (!token) {
            token = req.cookies?.bflux;
        }
        
        // Fallback to body token
        if(!token) token = req.body?.token;
        
        if(!token) return next(APIError.unauthenticated());
        const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        if(payload.role !== "admin") return next(APIError.unauthorized())
        req.userId = payload.id;
        req.userEmail = payload.email;
        req.userRole = payload.role;
        req.userPhone = payload.phone; // Add user phone from JWT payload

        next()
    }catch(error){
        if(error.message === "jwt expired") next(APIError.unauthenticated("Access Token Expired"));
        else next(error);
    }
}