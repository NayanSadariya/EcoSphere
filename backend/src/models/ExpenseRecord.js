import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Expense Record Schema (for auto emission calculation)
const expenseRecordSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  expense_type: {
    type: String,
    required: [true, 'Expense type is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative']
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
expenseRecordSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

const ExpenseRecord = model('ExpenseRecord', expenseRecordSchema);

export default ExpenseRecord;