import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "shop"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);
