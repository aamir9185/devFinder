import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status:{
        type: String,
        enum: {
        values: ["ignore","interested","accepted","rejected"],
        message: `{VALUE} is not supported for status`
      }
    }
},
{
    timestamps: true
});

connectionRequestSchema.pre("save",function(next){
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("You cannot send a connection request to yourself")
    }
    next()
})

connectionRequestSchema.index({fromUserId:1,toUserId:1},{unique:true})
export default mongoose.model("ConnectionRequest",connectionRequestSchema);