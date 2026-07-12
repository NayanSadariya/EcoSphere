import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Purchase Record Schema (for auto emission calculation)
const purchaseRecordSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  item_category: {
    type: String,
    required: [true, 'Item category is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be non-negative']
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
purchaseRecordSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

const PurchaseRecord = model('PurchaseRecord', purchaseRecordSchema);

export default PurchaseRecord;