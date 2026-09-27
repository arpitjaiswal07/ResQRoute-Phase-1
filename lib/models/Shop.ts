import mongoose, {
  Schema,
  type InferSchemaType,
} from 'mongoose'

const ShopSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    services: {
      vehicleRepair: {
        type: Boolean,
        default: true,
      },

      emergencyAssistance: {
        type: Boolean,
        default: true,
      },
    },

    category: {
      type: String,
      enum: [
        'mechanics',
        'towing',
        'rentals',
      ],
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    phone: {
      type: String,
      default: '',
    },

    whatsapp: {
      type: String,
      default: '',
    },

    open: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    lat: {
      type: Number,
      required: true,
    },

    lng: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      default: '',
    },

    verified: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      default: 'database',
    },
  },
  {
    timestamps: true,
  },
)

export type ShopDocument =
  InferSchemaType<typeof ShopSchema> & {
    _id: mongoose.Types.ObjectId
  }

export const ShopModel =
  mongoose.models.Shop ||
  mongoose.model('Shop', ShopSchema)