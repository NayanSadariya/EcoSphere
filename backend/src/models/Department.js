import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Define department statuses
const departmentStatuses = ['active', 'inactive'];

// Department Schema
const departmentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  head: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  parent_department: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  employee_count: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: departmentStatuses,
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for employees in this department
departmentSchema.virtual('employees', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  justOne: false
});

// Virtual for child departments
departmentSchema.virtual('children', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parent_department',
  justOne: false
});

// Update employee count when users are added/removed
departmentSchema.pre('remove', async function(next) {
  try {
    const User = model('User');
    await User.updateMany(
      { department: this._id },
      { $unset: { department: '' } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

const Department = model('Department', departmentSchema);

export default Department;