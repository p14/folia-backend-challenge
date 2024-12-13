import bcrypt from 'bcrypt';
import { Schema, Document, Types } from 'mongoose';

export interface User {
    email: string
    name: string
    password: string // Just for demo purposes, not a recommended practice
};

export interface UserDocument extends User, Document {
    _id: Types.ObjectId
    createdAt: Date
    comparePassword: (password: string) => Promise<boolean>
    updatedAt: Date
};

// Database defining schema
export const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    minimize: false,
    timestamps: true,
    versionKey: false,
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Skip if the password is not modified

    const saltRounds = 10; // Adjust this for desired hashing strength
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// Add a method to compare passwords
userSchema.methods.comparePassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
    transform: (_, doc) => {
        delete doc.password; // Remove the password field
        return doc;
    },
});
