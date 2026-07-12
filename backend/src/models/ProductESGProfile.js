import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// ProductESGProfile Schema
const productESGProfileSchema = new Schema({
  product_name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  esg_attributes: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ProductESGProfile = model('ProductESGProfile', productESGProfileSchema);

export default ProductESGProfile;