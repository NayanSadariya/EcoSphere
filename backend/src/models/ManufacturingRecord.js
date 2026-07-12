import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Manufacturing Record Schema (for auto emission calculation)
const manufacturingRecordSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  process_type: {
    type: String,
    required: [true, 'Process type is required'],
    trim: true
  },
  output_units: {
    type: Number,
    required: [true, 'Output units is required'],
    min: [0, 'Output units must be non-negative']
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
manufacturingRecordSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

const ManufacturingRecord = model('ManufacturingRecord', manufacturingRecordSchema);

export default ManufacturingRecord;