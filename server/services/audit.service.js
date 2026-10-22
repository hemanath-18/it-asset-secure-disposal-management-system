import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  action,
  user,
  asset = null,
  description,
  previousStatus = null,
  newStatus = null,
  ipAddress = null,
  metadata = null
}) => {
  try {
    const auditLog = new AuditLog({
      action,
      user: user._id || user.id || user,
      userRole: user.role || 'UNKNOWN',
      asset: asset ? (asset._id || asset) : null,
      description,
      previousStatus,
      newStatus,
      ipAddress,
      metadata
    });
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Failed to log audit event:', error.message);
  }
};
