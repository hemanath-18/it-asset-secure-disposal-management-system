import Asset from '../models/Asset.js';
import WipingRecord from '../models/WipingRecord.js';
import DisposalRecord from '../models/DisposalRecord.js';
import RecyclingRecord from '../models/RecyclingRecord.js';
import AuditLog from '../models/AuditLog.js';
import { logAuditEvent } from '../services/audit.service.js';
import { isValidTransition, getComplianceStatus } from '../services/lifecycle.service.js';

export const getAssets = async (req, res, next) => {
  try {
    const {
      search,
      status,
      type,
      department,
      condition,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { assetId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { assignedEmployee: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (department) query.department = department;
    if (condition) query.condition = condition;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: assets,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('createdBy', 'name email role department');
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const wipingRecord = await WipingRecord.findOne({ asset: asset._id })
      .populate('operator', 'name email')
      .populate('verifiedBy', 'name email');

    const disposalRecord = await DisposalRecord.findOne({ asset: asset._id })
      .populate('approvedBy', 'name email');

    const recyclingRecord = await RecyclingRecord.findOne({ asset: asset._id });

    const auditLogs = await AuditLog.find({ asset: asset._id })
      .populate('user', 'name email role')
      .sort({ timestamp: -1 });

    const complianceStatus = getComplianceStatus(asset, wipingRecord, disposalRecord);

    res.json({
      success: true,
      data: {
        asset,
        wipingRecord,
        disposalRecord,
        recyclingRecord,
        auditLogs,
        complianceStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req, res, next) => {
  try {
    const {
      assetId,
      type,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      assignedEmployee,
      department,
      location,
      condition,
      description,
      notes
    } = req.body;

    const existingSerial = await Asset.findOne({ serialNumber: serialNumber.trim() });
    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: `Asset with serial number '${serialNumber}' already exists`
      });
    }

    let generatedAssetId = assetId;
    if (!generatedAssetId) {
      const count = await Asset.countDocuments();
      generatedAssetId = `AST-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    const existingAssetId = await Asset.findOne({ assetId: generatedAssetId });
    if (existingAssetId) {
      generatedAssetId = `AST-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    }

    const asset = await Asset.create({
      assetId: generatedAssetId,
      type,
      category: category || 'Hardware',
      brand,
      model,
      serialNumber: serialNumber.trim(),
      purchaseDate,
      assignedEmployee,
      department,
      location,
      condition: condition || 'Good',
      status: 'REGISTERED',
      description,
      notes,
      createdBy: req.user._id
    });

    await logAuditEvent({
      action: 'ASSET_REGISTERED',
      user: req.user,
      asset,
      description: `Registered new asset ${asset.assetId} (${asset.brand} ${asset.model})`,
      newStatus: 'REGISTERED'
    });

    res.status(201).json({
      success: true,
      message: 'Asset registered successfully',
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const {
      type,
      category,
      brand,
      model,
      serialNumber,
      purchaseDate,
      assignedEmployee,
      department,
      location,
      condition,
      description,
      notes
    } = req.body;

    if (serialNumber && serialNumber !== asset.serialNumber) {
      const duplicateSerial = await Asset.findOne({ serialNumber, _id: { $ne: asset._id } });
      if (duplicateSerial) {
        return res.status(400).json({
          success: false,
          message: `Serial number '${serialNumber}' belongs to another asset`
        });
      }
      asset.serialNumber = serialNumber;
    }

    if (type) asset.type = type;
    if (category) asset.category = category;
    if (brand) asset.brand = brand;
    if (model) asset.model = model;
    if (purchaseDate) asset.purchaseDate = purchaseDate;
    if (assignedEmployee !== undefined) asset.assignedEmployee = assignedEmployee;
    if (department) asset.department = department;
    if (location) asset.location = location;
    if (condition) asset.condition = condition;
    if (description !== undefined) asset.description = description;
    if (notes !== undefined) asset.notes = notes;

    await asset.save();

    await logAuditEvent({
      action: 'ASSET_UPDATED',
      user: req.user,
      asset,
      description: `Updated asset details for ${asset.assetId}`
    });

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssetStatus = async (req, res, next) => {
  try {
    const { targetStatus, reason } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    if (!isValidTransition(asset.status, targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid lifecycle transition from '${asset.status}' to '${targetStatus}'`
      });
    }

    const previousStatus = asset.status;
    asset.status = targetStatus;
    await asset.save();

    if (targetStatus === 'DATA_WIPING') {
      let wipingRecord = await WipingRecord.findOne({ asset: asset._id });
      if (!wipingRecord) {
        await WipingRecord.create({
          asset: asset._id,
          wipingMethod: 'Secure Erase',
          status: 'IN_PROGRESS',
          operator: req.user._id,
          startedAt: new Date(),
          verificationStatus: 'PENDING'
        });
      } else if (wipingRecord.status !== 'IN_PROGRESS' && wipingRecord.status !== 'COMPLETED' && wipingRecord.status !== 'VERIFIED') {
        wipingRecord.status = 'IN_PROGRESS';
        wipingRecord.operator = req.user._id;
        wipingRecord.startedAt = new Date();
        wipingRecord.verificationStatus = 'PENDING';
        await wipingRecord.save();
      }
    }

    if (['DISPOSAL_APPROVED', 'REUSE', 'REFURBISH', 'RECYCLE', 'RESELL', 'DESTROY', 'DISPOSAL_COMPLETED'].includes(targetStatus)) {
      let disposalRecord = await DisposalRecord.findOne({ asset: asset._id });
      let method = 'Physical Destruction';
      if (targetStatus === 'RECYCLE') method = 'Recycle';
      else if (targetStatus === 'REUSE') method = 'Reuse';
      else if (targetStatus === 'REFURBISH') method = 'Refurbish';
      else if (targetStatus === 'RESELL') method = 'Resell';

      if (!disposalRecord) {
        await DisposalRecord.create({
          asset: asset._id,
          disposalMethod: method,
          approvalStatus: 'APPROVED',
          approvedBy: req.user._id,
          approvalDate: new Date(),
          finalStatus: targetStatus === 'DISPOSAL_COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          certificateNumber: `CERT-${asset.assetId}`
        });
      } else {
        if (targetStatus !== 'DISPOSAL_APPROVED') disposalRecord.disposalMethod = method;
        disposalRecord.approvalStatus = 'APPROVED';
        if (!disposalRecord.approvedBy) disposalRecord.approvedBy = req.user._id;
        if (!disposalRecord.approvalDate) disposalRecord.approvalDate = new Date();
        if (targetStatus === 'DISPOSAL_COMPLETED') disposalRecord.finalStatus = 'COMPLETED';
        await disposalRecord.save();
      }
    }

    await logAuditEvent({
      action: 'STATUS_CHANGED',
      user: req.user,
      asset,
      description: `Status changed from ${previousStatus} to ${targetStatus}${reason ? ` (${reason})` : ''}`,
      previousStatus,
      newStatus: targetStatus
    });

    res.json({
      success: true,
      message: `Asset status changed to ${targetStatus}`,
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    asset.status = 'ARCHIVED';
    await asset.save();

    await logAuditEvent({
      action: 'ASSET_ARCHIVED',
      user: req.user,
      asset,
      description: `Archived asset ${asset.assetId}`,
      previousStatus: asset.status,
      newStatus: 'ARCHIVED'
    });

    res.json({
      success: true,
      message: 'Asset archived successfully'
    });
  } catch (error) {
    next(error);
  }
};
