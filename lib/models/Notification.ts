import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: String,
      required: true,
      index: true,
    },

    recipientRole: {
      type: String,
      enum: ['user', 'shop'],
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'NEW_REQUEST',
        'REQUEST_ACCEPTED',
        'REQUEST_ON_THE_WAY',
        'REQUEST_ARRIVED',
        'REQUEST_COMPLETED',
        'REQUEST_CANCELLED',
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    breakdownId: {
      type: String,
      default: '',
      index: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

export type NotificationDocument =
  InferSchemaType<typeof NotificationSchema> & {
    _id: mongoose.Types.ObjectId
  }

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model(
    'Notification',
    NotificationSchema,
  )