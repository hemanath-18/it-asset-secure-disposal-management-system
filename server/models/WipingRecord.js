import mongoose from 'mongoose';

export const WIPING_METHODS = [
  'Secure Erase',
  'Cryptographic Erase',
  'Overwrite',
  'Manufacturer Secure Erase',
  'Physical Destruction',
  'Other'
];

export const WIPING_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'VERIFIED'
];

export const VERIFICATION_STATUSES = [
  'PENDING',
  'VERIFIED',
  'FAILED',
  'REQUIRES_REVIEW'
];

const wipingRecordSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      unique: true
    },
    wipingMethod: {
      type: String,
      enum: WIPING_METHODS,
      required: [true, 'Wiping method is required']
    },
    status: {
      type: String,
      enum: WIPING_STATUSES,
      default: 'IN_PROGRESS'
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'PENDING'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: {
      type: Date
    },
    verificationNotes: {
      type: String
    },
    evidenceReference: {
      type: String,
      trim: true
    },
    certificateUrl: {
      type: String,
      trim: true
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('WipingRecord', wipingRecordSchema);
