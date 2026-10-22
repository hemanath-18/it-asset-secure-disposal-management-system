import mongoose from 'mongoose';

export const RECYCLING_STATUSES = [
  'READY_FOR_RECYCLING',
  'ASSIGNED_TO_RECYCLER',
  'COLLECTED',
  'RECYCLING_IN_PROGRESS',
  'RECYCLING_COMPLETED'
];

const recyclingRecordSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },
    disposalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisposalRecord'
    },
    recyclerName: {
      type: String,
      required: [true, 'Recycler name is required'],
      trim: true
    },
    pickupDate: {
      type: Date
    },
    completionDate: {
      type: Date
    },
    recyclingStatus: {
      type: String,
      enum: RECYCLING_STATUSES,
      default: 'READY_FOR_RECYCLING'
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    certificateNumber: {
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

export default mongoose.model('RecyclingRecord', recyclingRecordSchema);
