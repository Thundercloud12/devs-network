import mongoose, { model, models, Schema } from "mongoose";
import { User } from "./User";



export interface CodingRoom{
    _id?: mongoose.Types.ObjectId,
    title: string,
    description: string,
    host: User,
    participants: User[],
    language: string,
    code?: string,
    isLive: boolean 
    createdAt?: Date,
    updatedAt?: Date,
    
}

const CodingRoomSchema = new Schema<CodingRoom>(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true,
            unique: true
        },
        host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        language: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: false
        },
        isLive: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    {timestamps: true}
);



const CodingRoom = models?.CodingRoom || model<CodingRoom>("CodingRoom", CodingRoomSchema);

export default CodingRoom;
