import Asset from '../models/Asset.js';
import WipingRecord from '../models/WipingRecord.js';
import DisposalRecord from '../models/DisposalRecord.js';
import AuditLog from '../models/AuditLog.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const activeAssets = await Asset.countDocuments({ status: { $in: ['REGISTERED', 'IN_USE'] } });
    const pendingDisposal = await Asset.countDocuments({ status: 'PENDING_DISPOSAL' });
    const dataWiping = await Asset.countDocuments({ status: { $in: ['DATA_WIPING', 'WIPING_COMPLETED'] } });
    const awaitingVerification = await WipingRecord.countDocuments({ verificationStatus: 'PENDING', status: 'COMPLETED' });
    const disposalApproved = await Asset.countDocuments({ status: 'DISPOSAL_APPROVED' });
    
    const recycled = await DisposalRecord.countDocuments({ disposalMethod: 'Recycle', approvalStatus: 'APPROVED' });
    const reused = await DisposalRecord.countDocuments({ disposalMethod: 'Reuse', approvalStatus: 'APPROVED' });
    const destroyed = await DisposalRecord.countDocuments({ disposalMethod: 'Physical Destruction', approvalStatus: 'APPROVED' });

    res.json({
      success: true,
      data: {
        totalAssets,
        activeAssets,
        pendingDisposal,
        dataWiping,
        awaitingVerification,
        disposalApproved,
        recycled,
        reused,
        destroyed
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardCharts = async (req, res, next) => {
  try {
    // 1. Asset Status Distribution
    const statusDistribution = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // 2. Asset Type Distribution
    const typeDistribution = await Asset.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // 3. Disposal Method Distribution
    const disposalMethodDistribution = await DisposalRecord.aggregate([
      { $group: { _id: '$disposalMethod', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // 4. Wiping Success / Failure Statistics
    const wipingStats = await WipingRecord.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // 5. Recent Activity Logs
    const recentLogs = await AuditLog.find()
      .populate('user', 'name email role')
      .populate('asset', 'assetId serialNumber brand model')
      .sort({ timestamp: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        statusDistribution,
        typeDistribution,
        disposalMethodDistribution,
        wipingStats,
        recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
};
