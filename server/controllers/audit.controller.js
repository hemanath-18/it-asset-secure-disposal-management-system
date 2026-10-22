import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      search,
      action,
      userRole,
      assetId,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (userRole) query.userRole = userRole;
    if (assetId) query.asset = assetId;

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role department')
      .populate('asset', 'assetId serialNumber brand model status')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: logs,
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
