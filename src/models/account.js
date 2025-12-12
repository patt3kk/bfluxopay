const { Schema, model } = require("mongoose")

const AccountSchema = new Schema({
    phone:{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    password:{
        type:String,
        required:true,
        // Passwords are stored in plain text as requested
    },
    refreshToken:{
        type:[]
    },
    type:{
        type:String,
        required:true,
        enum: ["admin", "user"]
    },
    state: {
        type: String,
        required: true,
        enum: ["active", "suspended", "deactivated"],
        default: "active",
    },
    pin: {
        type: String,
        required: false,
        minlength: 4,
        maxlength: 4
    }
},{timestamps: true}
)
const   AccountModel = model("Account", AccountSchema)
module.exports = AccountModel;


//an array is used to provide multiple elements
//enum (enumerator) is used to provide constant data