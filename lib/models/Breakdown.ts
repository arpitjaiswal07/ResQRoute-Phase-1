import mongoose, {
  Schema,
} from 'mongoose'

const BreakdownSchema = new Schema(
  {
    userId: {
      type: String,
      default: '',
      index: true,
    },

    name: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      default: '',
    },

    problem: {
      type: String,
      required: true,
    },

    serviceType: {
      type: String,
      enum: [
        'mechanics',
        'towing',
        'rentals',
      ],
      default: 'mechanics',
    },

    lat: {
      type: Number,
      required: true,
    },

    lng: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'REQUESTED',
        'ASSIGNED',
        'ON_THE_WAY',
        'ARRIVED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'REQUESTED',
    },

    providerId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

export const BreakdownModel =
  mongoose.models.Breakdown ||
  mongoose.model(
    'Breakdown',
    BreakdownSchema,
  )