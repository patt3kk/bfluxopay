require("dotenv").config()
exports.config = {
    APPNAME: process.env.APPNAME,
    PORT: process.env.PORT,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    DB_URI: process.env.DB_URI,
}