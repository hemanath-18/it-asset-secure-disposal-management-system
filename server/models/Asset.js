import mongoose from 'mongoose';

export const ASSET_TYPES = [
  'Laptop',
  'Desktop',
  'Server',
  'Hard Disk',
  'SSD',
  'Mobile',
  'Tablet',
  'Printer',
  'Monitor',
  'USB Drive',
  'Network Equipment',
  'Other'
];

export const ASSET_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Damaged'
];

export const ASSET_STATUSES = [
  'REGISTERED',
  'IN_USE',
  'PENDING_DISPOSAL',
  'DATA_WIPING',
  'WIPING_COMPLETED',
  'WIPING_FAILED',
  'WIPING_VERIFIED',
  'DISPOSAL_APPROVED',
  'REUSE',
  'REFURBISH',
  'RECYCLE',
  'RESELL',
  'DESTROY',
  'DISPOSAL_COMPLETED',
  'ARCHIVED'
];

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      required: [true, 'Asset type is required'],
      enum: ASSET_TYPES
    },
    category: {
      type: String,
      default: 'Hardware'
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      index: true
    },
    purchaseDate: {
      type: Date
    },
    assignedEmployee: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    condition: {
      type: String,
      enum: ASSET_CONDITIONS,
      default: 'Good'
    },
    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: 'REGISTERED',
      index: true
    },
    description: {
      type: String
    },
    notes: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

assetSchema.index({ brand: 'text', model: 'text', serialNumber: 'text', assetId: 'text' });

export default mongoose.model('Asset', assetSchema);
