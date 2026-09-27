import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessageDoc extends Document {
  username: string;
  text: string;
  timestamp: Date;
}

export interface IMessagePlain {
  _id?: string;
  id?: string;
  username: string;
  text: string;
  timestamp: string | Date;
}

const MessageSchema = new Schema<IMessageDoc>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      maxlength: 30,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Fallback in-memory storage array for when MongoDB Atlas URI is not yet configured
export const memoryMessages: IMessagePlain[] = [];

export const Message: Model<IMessageDoc> =
  mongoose.models.Message || mongoose.model<IMessageDoc>('Message', MessageSchema);
