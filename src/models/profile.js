const { Schema, model } = require("mongoose");


const ProfileSchema = new Schema({
    imageid: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    facebookUrl: {
        type: String,
    },
    instagramUrl: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId, /*mongoid*/
        ref: "Account",
        required: true,
    }
},
    {timestamps:true}
)

const ProfileModel = model("Profile", ProfileSchema)
module.exports = ProfileModel;