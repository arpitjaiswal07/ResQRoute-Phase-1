import mongoose, { Schema } from 'mongoose'
const SosSchema = new Schema({ lat: Number, lng: Number, accuracy: Number, message: String, status: { type: String, default: 'TRIGGERED' } }, { timestamps: true })
export const SosEventModel = mongoose.models.SosEvent || mongoose.model('SosEvent', SosSchema)
