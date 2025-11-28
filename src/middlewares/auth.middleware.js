const { config } = require("../config");
const { APIError } = require("./errorApi");
const jwt = require("jsonwebtoken");

exports.userRequired = (req,res,next) => {
    try{
        let token = req.cookie?.bflux; 
        if(!token) token = req.headers?.authorization?.split(" ")[1];
        if(!token) token = req.headers?.cookie?.split("=")[1];
        if(!token) token = req.body?.token;
        // console.log(token);P
        if(!token) return next(APIError.unauthenticated());
        const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        // if(payload.role !== "admin") return next(APIError.unauthorized)
        req.userId = payload.id;
        req.userEmail = payload.email;
        req.userRole = payload.role;

        next()
        // console.log(payload)
    }catch(error){
        if(error.message === "jwt expired") next(APIError.unauthenticated("Access Token Expired"));
        else next(error);  //sending it to error middleware
    }
}



exports.adminRequired = (req,res,next) => {
    try{
        let token = req.cookie?.bflux; 
        if(!token) token = req.headers?.authorization?.split(" ")[1];
        if(!token) token = req.headers?.cookie?.split("=")[1];
        if(!token) token = req.body?.token;
        // console.log(token);P
        if(!token) return next(APIError.unauthenticated());
        const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
        if(payload.role !== "admin") return next(APIError.unauthorized())
        req.userId = payload.id;
        req.userEmail = payload.email;
        req.userRole = payload.role;

        next()
        // console.log(payload)
    }catch(error){
        if(error.message === "jwt expired") next(APIError.unauthenticated("Access Token Expired"));
        else next(error);  //sending it to error middleware
    }
}

 