import mongoose, { model, models, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { Post } from "./Posts";

export interface User{
    username: string,
    email: string,
    password: string,
    _id?: mongoose.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date,
    Posts?: Post[]

}

const userSchema = new Schema<User>(
    {

        username: {
            type: String,
            required: true,
            unique: true
        },
        
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            unique: false,
        },
        Posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Posts" }],
    },
    {timestamps: true}
);

userSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
});

const User = models?.User || model<User>("User", userSchema);

export default User;
