import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Fleet Log Schema (for auto emission calculation)
const fleetLogSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  fuel_liters: {
    type: Number,
    required: [true, 'Fuel liters is required'],
    min: [0, 'Fuel liters must be non-negative']
  },
  distance_km: {
    type: Number,
    required: [true, 'Distance km is required'],
    min: [0, 'Distance km must be non-negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department details
fleetLogSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

const FleetLog = model('FleetLog', fleetLogSchema);

export default FleetLog;