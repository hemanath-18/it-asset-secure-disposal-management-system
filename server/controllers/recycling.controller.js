import RecyclingRecord from '../models/RecyclingRecord.js';
import Asset from '../models/Asset.js';
import DisposalRecord from '../models/DisposalRecord.js';
import { logAuditEvent } from '../services/audit.service.js';

export const getRecyclingRecords = async (req, res, next) => {
  try {
    const { recyclingStatus, search } = req.query;
    const query = {};

    if (recyclingStatus) query.recyclingStatus = recyclingStatus;

    let records = await RecyclingRecord.find(query)
      .populate({
        path: 'asset',
        populate: { path: 'createdBy', select: 'name email' }
      })
      .populate('disposalRecord')
      .sort({ createdAt: -1 });

    if (search) {
      records = records.filter(r => {
        if (!r.asset) return false;
        const searchLower = search.toLowerCase();
        return (
          r.asset.assetId?.toLowerCase().includes(searchLower) ||
          r.asset.serialNumber?.toLowerCase().includes(searchLower) ||
          r.recyclerName?.toLowerCase().includes(searchLower) ||
          r.referenceNumber?.toLowerCase().includes(searchLower)
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

export const updateRecyclingRecord = async (req, res, next) => {
  try {
    const {
      recyclerName,
      pickupDate,
      completionDate,
      recyclingStatus,
      referenceNumber,
      certificateNumber,
      notes
    } = req.body;

    const record = await RecyclingRecord.findById(req.params.id).populate('asset');
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Recycling record not found'
      });
    }

    const asset = record.asset;

    if (recyclerName) record.recyclerName = recyclerName;
    if (pickupDate) record.pickupDate = pickupDate;
    if (completionDate) record.completionDate = completionDate;
    if (referenceNumber) record.referenceNumber = referenceNumber;
    if (certificateNumber) record.certificateNumber = certificateNumber;
    if (notes) record.notes = notes;

    if (recyclingStatus) {
      const previousRecycleStatus = record.recyclingStatus;
      record.recyclingStatus = recyclingStatus;

      if (recyclingStatus === 'COLLECTED' && !record.pickupDate) {
        record.pickupDate = new Date();
      }

      if (recyclingStatus === 'RECYCLING_COMPLETED') {
        record.completionDate = new Date();
        if (asset) {
          const previousAssetStatus = asset.status;
          asset.status = 'DISPOSAL_COMPLETED';
          await asset.save();

          await logAuditEvent({
            action: 'RECYCLING_COMPLETED',
            user: req.user,
            asset,
            description: `Recycling process completed by vendor '${record.recyclerName}'. Cert: ${certificateNumber || 'N/A'}`,
            previousStatus: previousAssetStatus,
            newStatus: 'DISPOSAL_COMPLETED'
          });
        }
      } else {
        await logAuditEvent({
          action: 'RECYCLING_STATUS_UPDATED',
          user: req.user,
          asset,
          description: `Recycling status transitioned from ${previousRecycleStatus} to ${recyclingStatus}`
        });
      }
    }

    await record.save();

    res.json({
      success: true,
      message: 'Recycling record updated successfully',
      data: record
    });
  } catch (error) {
    next(error);
  }
};
