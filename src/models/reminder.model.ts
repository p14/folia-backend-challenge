import { Document, Schema, Types } from 'mongoose';

export enum RecurrenceType {
    DAILY = 'DAILY',
    INTERVAL = 'INTERVAL',
    DAY_OF_THE_WEEK = 'DAY_OF_THE_WEEK'
};

export enum RecurrenceDay {
    SUNDAY = 'Sunday',
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
}

export interface Reminder {
    userId: Types.ObjectId
    description: string
    recurrenceTime: string // HH:mm to represent 24-hour clock time
    recurrenceType: RecurrenceType
    customRecurrenceInterval?: number
    customRecurrenceDay?: RecurrenceDay
};

export interface ReminderDocument extends Reminder, Document {
    _id: Types.ObjectId
    createdAt: Date
    updatedAt: Date
};

// Database defining schema
export const reminderSchema = new Schema<ReminderDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    recurrenceTime: {
        type: String,
        required: true,
    },
    recurrenceType: {
        type: String,
        enum: RecurrenceType,
        required: true,
    },
    customRecurrenceInterval: {
        type: Number,
        required: false,
    },
    customRecurrenceDay: {
        type: String,
        enum: RecurrenceDay,
        required: false,
    },
}, {
    minimize: false,
    timestamps: true,
    versionKey: false,
});
