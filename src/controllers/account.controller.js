// Passwords are stored in plain text as requested
const AccountModel = require("../models/account");
const jwt = require("jsonwebtoken");
const { config } = require("../config");
const {cloudinary} = require("../utils/cloudinary");
const ProfileModel = require("../models/profile");
const { isEmailValid, isPhoneNumberValid } = require("../utils/validator");
const { APIError } = require("../middlewares/errorApi");


exports.register = async (req, res, next) =>{
    try{
        // Extract only required fields: phone and password
        const {phone, password} = req.body;
        
        // Validate required fields
        if(!phone) return res.status(400).json({error: "Phone number is required"})
        if(!password) return res.status(400).json({error: "Password is required"})
        
        // Validate phone number format
        if(!isPhoneNumberValid(phone)) return next(APIError.badRequest("Invalid phone number format"))
        
        // Validate password format (must be exactly 6 digits)
        const {isPasswordValid} = require("../utils/validator");
        if(!isPasswordValid(password)) return next(APIError.badRequest("Password must be exactly 6 digits"))

        // Check if phone number already exists
        const phoneExist = await AccountModel.findOne({phone}).exec();
        if(phoneExist) return next(APIError.badRequest("Phone number already exists"));
        
        // Store password in plain text as requested
        // Create user object with only required fields
        const user ={
            phone,
            password: password, // Plain text password
            type: "user"
        }
        
        // Create new user account
        const newUser = await AccountModel.create({...user})
        if(!newUser) return next(APIError.badRequest("Account failed to create"))
        
        // Return success response
        res.status(201).json({ 
            success: true, 
            msg:"Account created successfully",
            data: {
                id: newUser._id,
                phone: newUser.phone,
                type: newUser.type,
                createdAt: newUser.createdAt
            }
        })
    } catch (error) {
        next(error)
    }
}




exports.adminRegister = async (req, res, next) =>{
    try{
        // Extract only required fields: phone and password
        const {phone, password} = req.body;
        
        // Validate required fields
        if(!phone) return res.status(400).json({error: "Phone number is required"})
        if(!password) return res.status(400).json({error: "Password is required"})
        
        // Validate phone number format
        if(!isPhoneNumberValid(phone)) return next(APIError.badRequest("Invalid phone number format"))
        
        // Validate password format (must be exactly 6 digits)
        const {isPasswordValid} = require("../utils/validator");
        if(!isPasswordValid(password)) return next(APIError.badRequest("Password must be exactly 6 digits"))

        // Check if phone number already exists
        const phoneExist = await AccountModel.findOne({phone}).exec();
        if(phoneExist) return next(APIError.badRequest("Phone number already exists"));
        
        // Store password in plain text as requested
        // Create admin user object with only required fields
        const user ={
            phone,
            password: password, // Plain text password
            type: "admin"
        }
        
        // Create new admin account
        const newUser = await AccountModel.create({...user})
        if(!newUser) return next(APIError.badRequest("Admin account failed to create"))
        
        // Return success response
        res.status(201).json({ 
            success: true, 
            msg:"Admin account created successfully",
            data: {
                id: newUser._id,
                phone: newUser.phone,
                type: newUser.type,
                createdAt: newUser.createdAt
            }
        })
    } catch (error) {
        next(error)
    }
}










exports.login = async (req, res, next) => {
    try {
        let token = req.headers?.cookie?.split("=")[1];
        const {phone, password} = req.body;
        if(!phone) return res.status(400).json({error: "Phone number is required"});
        if(!password) return res.status(400).json({error: "Password is required"});

        const userExist = await AccountModel.findOne({phone});
        if(!userExist) return next(APIError.notFound("User not found"));


        // Compare passwords directly (plain text) as requested
        if(password !== userExist.password) return res.status(400).json({error: "Incorrect password"})
        if(userExist.state === "deactivated") return next(APIError.unauthorized("Account has been deactivated"))

        // if(userExist.refreshToken.length > 0)return res.status(403).json({error:"You're already logged in"})
        if (token) return res.status(403).json({error: "You are already logged in"})
        //authentication
         const payload = {
            id: userExist._id.toString(),
            role: userExist.type
        };
        // console.log(payload)
         const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
         const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
        //  userExist.refreshToken = [...userExist.refreshToken, refreshToken]
        userExist.refreshToken.push(refreshToken)
        userExist.save();
        res.cookie(
            "bflux", accessToken, {
                httpOnly:false,
                secure:true,
                samesite: "none",
                maxAge: 60*60 * 1000
            }
        )

         // Check if this is a request to the simplified /api/login endpoint
         if (req.path === '/login') {
            // Respond with the simplified format as requested
            return res.status(200).json({
               success: true,
               message: "Logged in"
            })
         } else {
            // Respond with the full format for other endpoints
            return res.status(200).json({
               success: true,
               message: "Logged in",
               data:{
                   id: userExist._id,
                   phone: userExist.phone,
                   type: userExist.type,
                   createdAt: userExist.createdAt
               },
               accessToken,
               refreshToken,
            })
         }
    }catch(error){
        next(error)
    }
}







exports.adminLogin = async (req, res, next) => {
    try {
        let token = req.headers?.cookie?.split("=")[1];
        const {phone, password} = req.body;
        if(!phone) return res.status(400).json({error: "Phone number is required"});
        if(!password) return res.status(400).json({error: "Password is required"});

        const userExist = await AccountModel.findOne({phone});
        if(!userExist) return next(APIError.notFound("Admin not found"));


        // Compare passwords directly (plain text) as requested
        if(password !== userExist.password) return res.status(400).json({error: "Incorrect password"})
        if(userExist.state === "deactivated") return next(APIError.unauthorized("Account has been deactivated"))

        if (token) return res.status(403).json({error: "You are already logged in"})
        //authentication
         const payload = {
            id: userExist._id.toString(),
            role: userExist.type
        };
        // console.log(payload)
         const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
         const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
        //  userExist.refreshToken = [...userExist.refreshToken, refreshToken]
        userExist.refreshToken.push(refreshToken)
        userExist.save();
        res.cookie(
            "bflux", accessToken, {
                httpOnly:false,
                secure:true,
                samesite: "none",
                maxAge: 60*60 * 1000
            }
        )

         // Check if this is a request to the simplified /api/login endpoint
         if (req.path === '/login') {
            // Respond with the simplified format as requested
            return res.status(200).json({
               success: true,
               message: "Logged in"
            })
         } else {
            // Respond with the full format for other endpoints
            return res.status(200).json({
               success: true,
               message: "Logged in",
               data:{
                   id: userExist._id,
                   phone: userExist.phone,
                   type: userExist.type,
                   createdAt: userExist.createdAt
               },
               accessToken,
               refreshToken,
            })
         }
    }catch(error){
        next(error)
    }
}







// const validateEmail=(email) =>{
//     const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// } 
// if(validateEmail(email)) {
//     console.log("email is vaild");
// }else {
//     console.log("email is not valid");
// }




// exports.updateProfile = async (req, res, next) =>{
//     try{
//         const {fileData} = req.body;
//         //first image upload
//         const profile = {};
//         if(fileData){
            
//         }
//     }catch(error){
// next(error)
//     }
// }










exports.uploadPicture = async (req, res) => {
    try{
        if(!req.userId) return next(APIError.unauthenticated());
        if (!req.body.file) return next(APIError.badRequest("No file uploaded"));

        const user = await AccountModel.findOne({_id:req.userId}).exec();
        if(!user) return next(APIError.notFound("User does not exist"));
        //upload file to cloudinary
        const result = await cloudinary.uploader.upload(req.file);

        //   console.log(result)

        //after uploading, you can save the cloudinary URL to your database or perform other actions
        const profile = {
            imageId: result.public_id,
            imageUrl: result.secure_url,
            user: req.userId,
        }
        const createPro = await ProfileModel.create({...profile});
        if(!createPro) return next(APIError.badRequest("Profile Update failed, try again"));
        if(createPro.error) return next(APIError.badRequest(createPro.error));
        res.status(200).json({success: true, msg:"Profile Updated Successfully"});
    }catch(error){
        next(error)
    }
};

//////////////////////////////////////////////////////////


// exports.updateProfile = async (req, res) =>{

//     const {imageid, imageUrl, facebookUrl, instagramUrl, user,} = req.body;

//     try{
//         const result = await cloudinary.uploader.upload(image,{
//             folder: "profile",
//         })
        
//     }catch(error){
//         return(error)
//     }
// }






exports.updateAccountStatus = async(req, res, next) => {
    try{
        const{id,state}= req.body;
        if(!id) return next(APIError.badRequest("Account id is required"));
        if(!state) return next(APIError.badRequest("Account state is required"));
        
        // Validate state value
        const validStates = ["active", "suspended", "deactivated"];
        if(!validStates.includes(state)) {
            return next(APIError.badRequest("Invalid state value. Must be one of: active, suspended, deactivated"));
        }
        
        const userExist = await AccountModel.findOne({_id:id.toString()});
        if(!userExist) return next(APIError.notFound("Account not found"));
        
        userExist.state = state;
        await userExist.save();
        
        res.status(200).json({
            success: true, 
            msg:"Account state updated successfully",
            data: {
                id: userExist._id,
                phone: userExist.phone,
                type: userExist.type,
                state: userExist.state,
                updatedAt: userExist.updatedAt
            }
        })
    }catch(error){
        next(error)
    }
}




exports.userAccounts = async (req, res, next) => {
    try {
        const users = await AccountModel.find({}).exec();
        if(users.length === 0) return next(APIError.notFound());
        
        // Map users to only include relevant data
        const userData = users.map(user => ({
            id: user._id,
            phone: user.phone,
            type: user.type,
            state: user.state,
            createdAt: user.createdAt
        }));
        
        res.status(200).json({
            success: true, 
            msg: "Users found", 
            data: userData
        })

    } catch(error){
      next(error)      
    }
}



exports.logout = async (req, res, next) => {
    try{
        let token = req.headers?.authorization?.split(" ")[1];
        if(!token) token = req.cookie?.bflux;
        if(!token) token = req.headers?.cookie?.split("=")[1];
        const {refreshToken} = req.body;

        if(!refreshToken) return res.status(400).json({error:"Refresh Token is required"})
        if(!token) return res.status(400).json({error: "Access Token is required"});
        const checkToken = jwt.decode(token)
        if(!checkToken || checkToken.error) return next(APIError.unauthenticated());

        const foundUser = await AccountModel.findOne({refreshToken}).exec();
        //Detected refresh token re-use
        if(!foundUser) {
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET , async (err, decoded) =>{
                if(err) return next(APIError.unauthorized("Invalid Refresh Token"));
                const usedToken = await AccountModel.findOne({_id:jwt.decoded.id}).exec();
                usedToken.refreshToken = [];
                usedToken.save();
            });
            console.log(foundUser)
            return next(APIError.unauthorized("Invalid Refresh Token"))
        }


        const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
        //evaluate jwt
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async(err, decoded) => {
            if(err) {
                foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
            }
            if (err || foundUser._id.toString() !== decoded.id) return next(APIError.unauthenticated("Token expired"));
        });
        foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
        res.clearCookie("bflux");
        res
        .status(200)
        .json({success: true, msg: "You have successfully logged Out"})

    } catch(error){
        next(error)
    }
}




exports.handleRefreshToken = async (req, res, next) => {
    try{
        
        let token = req.headers?.authorization?.split(" ")[1];
        if (!token) token = req.headers?.cookie?.split("=")[1];
        const {refreshToken} = req.body;
        if(!refreshToken) return next(APIError.badRequest("Refresh Token is required"));
        if(!token) return next(APIError.badRequest("Access Token is required"));
        const checkToken = jwt.decode(token, config.ACCESS_TOKEN_SECRET);
        if(!checkToken || checkToken.error) return next(APIError.unauthenticated());

        const foundUser = await AccountModel.findOne({refreshToken}).exec();
        //Detected refresh token re-use
        if(!foundUser) {
            jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET , async (err, decoded) =>{
                if(err) return next(APIError.unauthorized("Invalid Refresh Token"));
                const usedToken = await AccountModel.findOne({_id:jwt.decoded.id}).exec();
                usedToken.refreshToken = [];
                usedToken.save();
            });
            console.log(foundUser)
            return next(APIError.unauthorized("Invalid Refresh Token"))
        }

        const newRefreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken);
        //evaluate jwt
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if(err){
                foundUser.refreshToken = [...newRefreshTokenArr];
                foundUser.save();
            }
            if(err || foundUser.id.toString() !== decoded.id) return next(APIError.unauthenticated("Token Expired"))
        });



        const payload = {
            id: foundUser._id/*.toString()*/,
            role: foundUser.type
        };
        // console.log(payload)
         const accessToken = jwt.sign(payload,config.ACCESS_TOKEN_SECRET,{expiresIn:"15m"});
         const newRefreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET,{expiresIn:"30m"});
         foundUser.refreshToken = [...newRefreshTokenArr, newRefreshToken]
        foundUser.save();
        res.cookie(
            "bflux", accessToken, {
                httpOnly:false,
                secure:true,
                samesite: "none",
                // maxAge: 60*60 * 1000
            }
        )

         return res.status(200).json({
            success: true,
            msg: "login successful",
            accessToken,
            newRefreshToken,
         })

    }catch(error){
        next(error)
    }
}



exports.userCheckToken = async (req, res, next) =>{
    try{
        res.status(200).json({success: true, msg: "token is valid"});
    }catch(error){
        next(error)
    }
}