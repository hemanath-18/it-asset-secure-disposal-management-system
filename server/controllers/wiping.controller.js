import WipingRecord from '../models/WipingRecord.js';
import Asset from '../models/Asset.js';
import { logAuditEvent } from '../services/audit.service.js';
import { isValidTransition } from '../services/lifecycle.service.js';

export const getWipingRecords = async (req, res, next) => {
  try {
    const { status, verificationStatus, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    // Auto-sync any asset currently in DATA_WIPING state that lacks a WipingRecord
    const wipingAssets = await Asset.find({ status: 'DATA_WIPING' });
    for (const ast of wipingAssets) {
      const existing = await WipingRecord.findOne({ asset: ast._id });
      if (!existing) {
        await WipingRecord.create({
          asset: ast._id,
          wipingMethod: 'Secure Erase',
          status: 'IN_PROGRESS',
          operator: req.user._id,
          startedAt: new Date(),
          verificationStatus: 'PENDING'
        });
      }
    }

    let records = await WipingRecord.find(query)
      .populate('asset')
      .populate('operator', 'name email role')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    if (search) {
      records = records.filter(r => {
        if (!r.asset) return false;
        const searchLower = search.toLowerCase();
        return (
          r.asset.assetId?.toLowerCase().includes(searchLower) ||
          r.asset.serialNumber?.toLowerCase().includes(searchLower) ||
          r.asset.brand?.toLowerCase().includes(searchLower) ||
          r.asset.model?.toLowerCase().includes(searchLower)
        );
      });
    }

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

export const getWipingRecordById = async (req, res, next) => {
  try {
    const record = await WipingRecord.findById(req.params.id)
      .populate('asset')
      .populate('operator', 'name email role department')
      .populate('verifiedBy', 'name email role department');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Wiping record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

export const initiateWiping = async (req, res, next) => {
  try {
    const { assetId, wipingMethod, notes } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if (!isValidTransition(asset.status, 'DATA_WIPING')) {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate data wiping for asset in '${asset.status}' state. Must be PENDING_DISPOSAL or WIPING_FAILED.`
      });
    }

    let wipingRecord = await WipingRecord.findOne({ asset: asset._id });
    if (wipingRecord) {
      wipingRecord.wipingMethod = wipingMethod;
      wipingRecord.status = 'IN_PROGRESS';
      wipingRecord.operator = req.user._id;
      wipingRecord.startedAt = new Date();
      wipingRecord.completedAt = undefined;
      wipingRecord.verificationStatus = 'PENDING';
      wipingRecord.notes = notes;
      await wipingRecord.save();
    } else {
      wipingRecord = await WipingRecord.create({
        asset: asset._id,
        wipingMethod,
        status: 'IN_PROGRESS',
        operator: req.user._id,
        startedAt: new Date(),
        notes
      });
    }

    const previousStatus = asset.status;
    asset.status = 'DATA_WIPING';
    await asset.save();

    await logAuditEvent({
      action: 'WIPING_STARTED',
      user: req.user,
      asset,
      description: `Initiated data wiping operation using '${wipingMethod}' method`,
      previousStatus,
      newStatus: 'DATA_WIPING'
    });

    res.status(201).json({
      success: true,
      message: 'Data wiping initiated successfully',
      data: wipingRecord
    });
  } catch (error) {
    next(error);
  }
};

export const updateWipingStatus = async (req, res, next) => {
  try {
    const { status, evidenceReference, certificateUrl, notes } = req.body;
    const wipingRecord = await WipingRecord.findById(req.params.id).populate('asset');

    if (!wipingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Wiping record not found'
      });
    }

    const asset = wipingRecord.asset;
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Associated asset not found'
      });
    }

    const previousAssetStatus = asset.status;

    if (status === 'COMPLETED') {
      wipingRecord.status = 'COMPLETED';
      wipingRecord.completedAt = new Date();
      if (evidenceReference) wipingRecord.evidenceReference = evidenceReference;
      if (certificateUrl) wipingRecord.certificateUrl = certificateUrl;
      if (notes) wipingRecord.notes = notes;
      wipingRecord.verificationStatus = 'PENDING';
      await wipingRecord.save();

      asset.status = 'WIPING_COMPLETED';
      await asset.save();

      await logAuditEvent({
        action: 'WIPING_COMPLETED',
        user: req.user,
        asset,
        description: `Completed data wiping operation. Evidence ref: ${evidenceReference || 'N/A'}`,
        previousStatus: previousAssetStatus,
        newStatus: 'WIPING_COMPLETED'
      });
    } else if (status === 'FAILED') {
      wipingRecord.status = 'FAILED';
      wipingRecord.verificationStatus = 'FAILED';
      if (notes) wipingRecord.notes = notes;
      await wipingRecord.save();

      asset.status = 'WIPING_FAILED';
      await asset.save();

      await logAuditEvent({
        action: 'WIPING_FAILED',
        user: req.user,
        asset,
        description: `Data wiping operation failed: ${notes || 'Reason unspecified'}`,
        previousStatus: previousAssetStatus,
        newStatus: 'WIPING_FAILED'
      });
    }

    res.json({
      success: true,
      message: `Wiping status updated to ${status}`,
      data: wipingRecord
    });
  } catch (error) {
    next(error);
  }
};

export const verifyWiping = async (req, res, next) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;
    const wipingRecord = await WipingRecord.findById(req.params.id).populate('asset');

    if (!wipingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Wiping record not found'
      });
    }

    const asset = wipingRecord.asset;
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Associated asset not found'
      });
    }

    if (!['VERIFIED', 'FAILED', 'REQUIRES_REVIEW'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const previousAssetStatus = asset.status;
    wipingRecord.verificationStatus = verificationStatus;
    wipingRecord.verifiedBy = req.user._id;
    wipingRecord.verifiedAt = new Date();
    wipingRecord.verificationNotes = verificationNotes;

    if (verificationStatus === 'VERIFIED') {
      wipingRecord.status = 'VERIFIED';
      asset.status = 'WIPING_VERIFIED';
    } else if (verificationStatus === 'FAILED') {
      wipingRecord.status = 'FAILED';
      asset.status = 'WIPING_FAILED';
    }

    await wipingRecord.save();
    await asset.save();

    await logAuditEvent({
      action: verificationStatus === 'VERIFIED' ? 'WIPING_VERIFIED' : 'WIPING_VERIFICATION_FAILED',
      user: req.user,
      asset,
      description: `Wiping verification marked as ${verificationStatus}: ${verificationNotes || 'No notes'}`,
      previousStatus: previousAssetStatus,
      newStatus: asset.status
    });

    res.json({
      success: true,
      message: `Wiping verification recorded as ${verificationStatus}`,
      data: wipingRecord
    });
  } catch (error) {
    next(error);
  }
};
