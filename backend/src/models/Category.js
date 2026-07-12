import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Define category types
const categoryTypes = ['CSR_ACTIVITY', 'CHALLENGE'];

// Define category statuses
const categoryStatuses = ['active', 'inactive'];

// Category Schema
const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    isrequired: true,
    trim: true
  },
  type: {
    type: true
  },
  type: {
    type: String,
    enum: categoryTypes,
    required: [true, 'Category type is required']
  },
  status: {
    type: String,
    enum: categoryStatuses,
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for CSR activities in this category
categorySchema.virtual('csrActivities', {
  ref: 'CSRActivity',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

// Virtual for challenges in this category
categorySchema.virtual('challenges', {
  ref: 'Challenge',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

const Category = model('Category', categorySchema);

export default Category;