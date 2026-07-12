import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// EmissionFactor Schema
const emissionFactorSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Emission factor name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  co2_factor_value: {
    type: Number,
    required: [true, 'CO2 factor value is required'],
    min: [0, 'CO2 factor value must be positive']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for carbon transactions using this factor
emissionFactorSchema.virtual('carbonTransactions', {
  ref: 'CarbonTransaction',
  localField: '_id',
  foreignField: 'emission_factor',
  justOne: false
});

const EmissionFactor = model('EmissionFactor', emissionFactorSchema);

export default EmissionFactor;