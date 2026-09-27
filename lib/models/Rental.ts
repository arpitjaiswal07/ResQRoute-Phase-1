import mongoose, { Schema } from 'mongoose'
const RentalSchema = new Schema({ name: String, phone: String, lat: Number, lng: Number, available: { type: Boolean, default: true } }, { timestamps: true })
export const RentalModel = mongoose.models.Rental || mongoose.model('Rental', RentalSchema)
