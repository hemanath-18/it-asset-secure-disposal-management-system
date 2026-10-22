export const ALLOWED_TRANSITIONS = {
  REGISTERED: ['IN_USE', 'PENDING_DISPOSAL', 'ARCHIVED'],
  IN_USE: ['PENDING_DISPOSAL'],
  PENDING_DISPOSAL: ['DATA_WIPING', 'IN_USE'],
  DATA_WIPING: ['WIPING_COMPLETED', 'WIPING_FAILED'],
  WIPING_COMPLETED: ['WIPING_VERIFIED', 'WIPING_FAILED'],
  WIPING_FAILED: ['DATA_WIPING', 'PENDING_DISPOSAL'],
  WIPING_VERIFIED: ['DISPOSAL_APPROVED'],
  DISPOSAL_APPROVED: ['REUSE', 'REFURBISH', 'RECYCLE', 'RESELL', 'DESTROY'],
  REUSE: ['DISPOSAL_COMPLETED', 'IN_USE'],
  REFURBISH: ['DISPOSAL_COMPLETED', 'REUSE'],
  RECYCLE: ['DISPOSAL_COMPLETED'],
  RESELL: ['DISPOSAL_COMPLETED'],
  DESTROY: ['DISPOSAL_COMPLETED'],
  DISPOSAL_COMPLETED: ['ARCHIVED'],
  ARCHIVED: []
};

export const isValidTransition = (currentStatus, targetStatus) => {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
};

export const getComplianceStatus = (asset, wipingRecord, disposalRecord) => {
  if (!asset) return 'REQUIRES_REVIEW';
  
  if (['DISPOSAL_COMPLETED', 'ARCHIVED'].includes(asset.status)) {
    if (wipingRecord?.verificationStatus === 'VERIFIED' && disposalRecord?.approvalStatus === 'APPROVED') {
      return 'COMPLIANT';
    }
    return 'REQUIRES_REVIEW';
  }

  if (['WIPING_FAILED', 'VERIFICATION_FAILED'].includes(asset.status) || wipingRecord?.verificationStatus === 'FAILED') {
    return 'REQUIRES_REVIEW';
  }

  return 'PENDING';
};
