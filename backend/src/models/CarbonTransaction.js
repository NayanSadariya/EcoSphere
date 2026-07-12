import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Source types for carbon transactions
const sourceTypes = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET'];

// Carbon Transaction Schema
const carbonTransactionSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  source_type: {
    type: String,
    enum: sourceTypes,
    required: [true, 'Source type is required']
  },
  source_record_id: {
    type: Schema.Types.ObjectId,
    required: [true, 'Source record ID is required'],
    refPath: 'source_type' // Dynamic reference based on source_type
  },
  emission_factor: {
    type: Schema.Types.ObjectId,
    ref: 'EmissionFactor',
    required: [true, 'Emission factor is required']
  },
  calculated_co2: {
    type: Number,
    required: [true, 'Calculated CO2 is required'],
    min: [0, 'CO2 value must be non-negative']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  is_auto_calculated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department details
carbonTransactionSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Virtual for emission factor details
carbonTransactionSchema.virtual('emissionFactorDetails', {
  ref: 'EmissionFactor',
  localField: 'emission_factor',
  foreignField: '_id',
  justOne: true
});

// Virtual for source record details (populated dynamically)
carbonTransactionSchema.virtual('sourceRecordDetails', {
  refPath: 'source_type',
  localField: 'source_record_id',
  foreignField: '_id',
  justOne: true,
  options: {
    // This will be populated dynamically based on source_type
    // We'll handle this in the controller/service layer
  }
});

// Indexes for better query performance
carbonTransactionSchema.index({ department: 1, date: -1 });
carbonTransactionSchema.index({ source_type: 1 });
carbonTransactionSchema.index({ is_auto_calculated: 1 });

const CarbonTransaction = model('CarbonTransaction', carbonTransactionSchema);

export default CarbonTransaction;