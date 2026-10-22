import mongoose from 'mongoose';

export const DISPOSAL_METHODS = [
  'Reuse',
  'Refurbish',
  'Recycle',
  'Resell',
  'Physical Destruction'
];

export const APPROVAL_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED'
];

const disposalRecordSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      unique: true
    },
    disposalMethod: {
      type: String,
      enum: DISPOSAL_METHODS,
      required: [true, 'Disposal method is required']
    },
    approvalStatus: {
      type: String,
      enum: APPROVAL_STATUSES,
      default: 'PENDING'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: {
      type: Date
    },
    approvalNotes: {
      type: String
    },
    vendorRecycler: {
      type: String,
      trim: true
    },
    certificateNumber: {
      type: String,
      trim: true
    },
    disposalDate: {
      type: Date
    },
    finalStatus: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('DisposalRecord', disposalRecordSchema);
