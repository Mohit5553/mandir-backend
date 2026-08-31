const AuditLog = require('../models/AuditLog');
const logger = require('./loggerService');

/**
 * Utility to write audit logs to the database and standard Winston logger
 */
const logAudit = async ({ req, userId, userName, userEmail, action, details }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'N/A';
    
    let uId = userId;
    let uName = userName;
    let uEmail = userEmail;

    // Retrieve user context from standard JWT request object if present
    if (req && req.user) {
      uId = uId || req.user.id;
      uName = uName || req.user.name;
      uEmail = uEmail || req.user.email;
    }

    const audit = new AuditLog({
      userId: uId,
      userName: uName,
      userEmail: uEmail,
      action,
      details,
      ipAddress
    });

    await audit.save();
    
    // Also write structured entry to Winston combined log
    logger.info(`📝 AUDIT LOG - Action: ${action} - User: ${uEmail || 'System/Anonymous'} - IP: ${ipAddress}`, {
      userId: uId,
      action,
      details
    });
  } catch (error) {
    logger.error('❌ Failed to write audit log entry:', error);
  }
};

module.exports = { logAudit };
