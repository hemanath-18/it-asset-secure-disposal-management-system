import Asset from '../models/Asset.js';
import WipingRecord from '../models/WipingRecord.js';
import DisposalRecord from '../models/DisposalRecord.js';
import AuditLog from '../models/AuditLog.js';
import { getComplianceStatus } from '../services/lifecycle.service.js';

export const getAssetDisposalReport = async (req, res, next) => {
  try {
    const { startDate, endDate, disposalMethod } = req.query;
    const query = {};

    if (disposalMethod) query.disposalMethod = disposalMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const records = await DisposalRecord.find(query)
      .populate('asset')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    const report = records.map(r => ({
      assetId: r.asset?.assetId || 'N/A',
      type: r.asset?.type || 'N/A',
      serialNumber: r.asset?.serialNumber || 'N/A',
      brandModel: `${r.asset?.brand || ''} ${r.asset?.model || ''}`,
      status: r.asset?.status || 'N/A',
      disposalMethod: r.disposalMethod,
      approvalStatus: r.approvalStatus,
      approvedBy: r.approvedBy?.name || 'N/A',
      approvalDate: r.approvalDate,
      vendorRecycler: r.vendorRecycler || 'N/A',
      certificateNumber: r.certificateNumber || 'N/A',
      disposalDate: r.disposalDate
    }));

    res.json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getDataWipingReport = async (req, res, next) => {
  try {
    const { startDate, endDate, wipingMethod, status } = req.query;
    const query = {};

    if (wipingMethod) query.wipingMethod = wipingMethod;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const records = await WipingRecord.find(query)
      .populate('asset')
      .populate('operator', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    const report = records.map(r => ({
      assetId: r.asset?.assetId || 'N/A',
      type: r.asset?.type || 'N/A',
      serialNumber: r.asset?.serialNumber || 'N/A',
      wipingMethod: r.wipingMethod,
      operator: r.operator?.name || 'N/A',
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      wipingStatus: r.status,
      verificationStatus: r.verificationStatus,
      verifiedBy: r.verifiedBy?.name || 'N/A',
      evidenceReference: r.evidenceReference || 'N/A'
    }));

    res.json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getComplianceReport = async (req, res, next) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });

    const wipingRecords = await WipingRecord.find();
    const disposalRecords = await DisposalRecord.find();

    const wipingMap = new Map(wipingRecords.map(w => [w.asset.toString(), w]));
    const disposalMap = new Map(disposalRecords.map(d => [d.asset.toString(), d]));

    const report = assets.map(asset => {
      const wiping = wipingMap.get(asset._id.toString());
      const disposal = disposalMap.get(asset._id.toString());
      const compliance = getComplianceStatus(asset, wiping, disposal);

      return {
        assetId: asset.assetId,
        serialNumber: asset.serialNumber,
        brandModel: `${asset.brand} ${asset.model}`,
        department: asset.department,
        currentStatus: asset.status,
        wipingMethod: wiping?.wipingMethod || 'N/A',
        wipingVerification: wiping?.verificationStatus || 'N/A',
        disposalMethod: disposal?.disposalMethod || 'N/A',
        disposalApproval: disposal?.approvalStatus || 'N/A',
        certificateNumber: disposal?.certificateNumber || wiping?.evidenceReference || 'N/A',
        complianceStatus: compliance
      };
    });

    res.json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    next(error);
  }
};
