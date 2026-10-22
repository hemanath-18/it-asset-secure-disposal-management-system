import DisposalRecord from '../models/DisposalRecord.js';
import WipingRecord from '../models/WipingRecord.js';
import Asset from '../models/Asset.js';
import RecyclingRecord from '../models/RecyclingRecord.js';
import { logAuditEvent } from '../services/audit.service.js';

export const getDisposalRecords = async (req, res, next) => {
  try {
    const { approvalStatus, disposalMethod, search } = req.query;
    const query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (disposalMethod) query.disposalMethod = disposalMethod;

    // Auto-sync any asset currently in a disposal stage that lacks a DisposalRecord
    const disposalAssets = await Asset.find({
      status: { $in: ['DISPOSAL_APPROVED', 'REUSE', 'REFURBISH', 'RECYCLE', 'RESELL', 'DESTROY', 'DISPOSAL_COMPLETED'] }
    });
    for (const ast of disposalAssets) {
      const existing = await DisposalRecord.findOne({ asset: ast._id });
      if (!existing) {
        let method = 'Physical Destruction';
        if (ast.status === 'RECYCLE') method = 'Recycle';
        else if (ast.status === 'REUSE') method = 'Reuse';
        else if (ast.status === 'REFURBISH') method = 'Refurbish';
        else if (ast.status === 'RESELL') method = 'Resell';

        await DisposalRecord.create({
          asset: ast._id,
          disposalMethod: method,
          approvalStatus: 'APPROVED',
          approvedBy: req.user._id,
          approvalDate: new Date(),
          finalStatus: ast.status === 'DISPOSAL_COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          certificateNumber: `CERT-${ast.assetId}`
        });
      }
    }

    let records = await DisposalRecord.find(query)
      .populate('asset')
      .populate('approvedBy', 'name email role')
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

export const getDisposalRecordById = async (req, res, next) => {
  try {
    const record = await DisposalRecord.findById(req.params.id)
      .populate('asset')
      .populate('approvedBy', 'name email role department');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Disposal record not found'
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

export const createDisposalRequest = async (req, res, next) => {
  try {
    const { assetId, disposalMethod, notes, vendorRecycler } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Verify wiping record status
    const wipingRecord = await WipingRecord.findOne({ asset: asset._id });
    if (!wipingRecord || wipingRecord.verificationStatus !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create disposal request for an asset without verified data wiping completion'
      });
    }

    let disposalRecord = await DisposalRecord.findOne({ asset: asset._id });
    if (disposalRecord) {
      disposalRecord.disposalMethod = disposalMethod;
      disposalRecord.approvalStatus = 'PENDING';
      disposalRecord.notes = notes;
      if (vendorRecycler) disposalRecord.vendorRecycler = vendorRecycler;
      await disposalRecord.save();
    } else {
      disposalRecord = await DisposalRecord.create({
        asset: asset._id,
        disposalMethod,
        approvalStatus: 'PENDING',
        vendorRecycler,
        notes
      });
    }

    await logAuditEvent({
      action: 'DISPOSAL_REQUESTED',
      user: req.user,
      asset,
      description: `Disposal request submitted with method '${disposalMethod}'`
    });

    res.status(201).json({
      success: true,
      message: 'Disposal request created and pending approval',
      data: disposalRecord
    });
  } catch (error) {
    next(error);
  }
};

export const approveDisposal = async (req, res, next) => {
  try {
    const { approvalStatus, approvalNotes } = req.body;
    const disposalRecord = await DisposalRecord.findById(req.params.id).populate('asset');

    if (!disposalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Disposal record not found'
      });
    }

    const asset = disposalRecord.asset;
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Associated asset not found'
      });
    }

    if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status'
      });
    }

    const previousAssetStatus = asset.status;
    disposalRecord.approvalStatus = approvalStatus;
    disposalRecord.approvedBy = req.user._id;
    disposalRecord.approvalDate = new Date();
    disposalRecord.approvalNotes = approvalNotes;

    if (approvalStatus === 'APPROVED') {
      asset.status = 'DISPOSAL_APPROVED';
      
      // If method is Recycle, initialize RecyclingRecord
      if (disposalRecord.disposalMethod === 'Recycle') {
        const existingRecycle = await RecyclingRecord.findOne({ asset: asset._id });
        if (!existingRecycle) {
          await RecyclingRecord.create({
            asset: asset._id,
            disposalRecord: disposalRecord._id,
            recyclerName: disposalRecord.vendorRecycler || 'Pending Assignment',
            recyclingStatus: 'READY_FOR_RECYCLING'
          });
        }
      }
    }

    await disposalRecord.save();
    await asset.save();

    await logAuditEvent({
      action: approvalStatus === 'APPROVED' ? 'DISPOSAL_APPROVED' : 'DISPOSAL_REJECTED',
      user: req.user,
      asset,
      description: `Disposal request for ${disposalRecord.disposalMethod} was ${approvalStatus}: ${approvalNotes || 'No notes'}`,
      previousStatus: previousAssetStatus,
      newStatus: asset.status
    });

    res.json({
      success: true,
      message: `Disposal request ${approvalStatus.toLowerCase()} successfully`,
      data: disposalRecord
    });
  } catch (error) {
    next(error);
  }
};

export const executeDisposalMethod = async (req, res, next) => {
  try {
    const { vendorRecycler, certificateNumber, finalStatus, notes, newAssignedEmployee } = req.body;
    const disposalRecord = await DisposalRecord.findById(req.params.id).populate('asset');

    if (!disposalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Disposal record not found'
      });
    }

    if (disposalRecord.approvalStatus !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Disposal request must be approved before executing disposal operation'
      });
    }

    const asset = disposalRecord.asset;
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Associated asset not found'
      });
    }

    const method = disposalRecord.disposalMethod; // Reuse, Refurbish, Recycle, Resell, Physical Destruction
    const previousAssetStatus = asset.status;

    let targetAssetStatus = 'DISPOSAL_COMPLETED';
    if (method === 'Reuse') targetAssetStatus = 'REUSE';
    else if (method === 'Refurbish') targetAssetStatus = 'REFURBISH';
    else if (method === 'Recycle') targetAssetStatus = 'RECYCLE';
    else if (method === 'Resell') targetAssetStatus = 'RESELL';
    else if (method === 'Physical Destruction') targetAssetStatus = 'DESTROY';

    if (vendorRecycler) disposalRecord.vendorRecycler = vendorRecycler;
    if (certificateNumber) disposalRecord.certificateNumber = certificateNumber;
    disposalRecord.disposalDate = new Date();
    disposalRecord.finalStatus = finalStatus || 'COMPLETED';
    if (notes) disposalRecord.notes = notes;
    await disposalRecord.save();

    asset.status = targetAssetStatus;
    if (method === 'Reuse' && newAssignedEmployee) {
      asset.assignedEmployee = newAssignedEmployee;
    }
    await asset.save();

    await logAuditEvent({
      action: `DISPOSAL_METHOD_${method.toUpperCase().replace(/\s+/g, '_')}`,
      user: req.user,
      asset,
      description: `Disposal operation performed via method '${method}'. Certificate: ${certificateNumber || 'N/A'}`,
      previousStatus: previousAssetStatus,
      newStatus: targetAssetStatus
    });

    res.json({
      success: true,
      message: `Disposal executed using ${method} method`,
      data: { disposalRecord, asset }
    });
  } catch (error) {
    next(error);
  }
};

export const completeDisposal = async (req, res, next) => {
  try {
    const disposalRecord = await DisposalRecord.findById(req.params.id).populate('asset');
    if (!disposalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Disposal record not found'
      });
    }

    const asset = disposalRecord.asset;
    const previousAssetStatus = asset.status;
    asset.status = 'DISPOSAL_COMPLETED';
    await asset.save();

    disposalRecord.finalStatus = 'DISPOSAL_COMPLETED';
    await disposalRecord.save();

    await logAuditEvent({
      action: 'DISPOSAL_COMPLETED',
      user: req.user,
      asset,
      description: `Final asset disposal workflow completed for ${asset.assetId}`,
      previousStatus: previousAssetStatus,
      newStatus: 'DISPOSAL_COMPLETED'
    });

    res.json({
      success: true,
      message: 'Asset disposal fully completed',
      data: { disposalRecord, asset }
    });
  } catch (error) {
    next(error);
  }
};
