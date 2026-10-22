import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userRole: {
      type: String,
      required: true
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    previousStatus: {
      type: String
    },
    newStatus: {
      type: String
    },
    ipAddress: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('AuditLog', auditLogSchema);
