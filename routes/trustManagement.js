const express = require('express');
const router = express.Router();
const trustManagementController = require('../controllers/trustManagementController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');

// Public route to view trust structure
router.get('/', trustManagementController.getTrustManagement);

// Protected admin routes to modify categories
router.post('/categories', verifyToken, requirePermission('Trust Management', 'create'), trustManagementController.addCategory);
router.put('/categories/:categoryId', verifyToken, requirePermission('Trust Management', 'update'), trustManagementController.updateCategory);
router.delete('/categories/:categoryId', verifyToken, requirePermission('Trust Management', 'delete'), trustManagementController.deleteCategory);

// Protected admin routes to modify roles
router.post('/roles', verifyToken, requirePermission('Trust Management', 'create'), trustManagementController.addRole);
router.put('/roles/:roleId', verifyToken, requirePermission('Trust Management', 'update'), trustManagementController.updateRole);
router.delete('/roles/:roleId', verifyToken, requirePermission('Trust Management', 'delete'), trustManagementController.deleteRole);

// Protected admin routes to modify members
router.post('/members', verifyToken, requirePermission('Trust Management', 'create'), trustManagementController.addMember);
router.put('/members/:memberId', verifyToken, requirePermission('Trust Management', 'update'), trustManagementController.updateMember);
router.delete('/members/:memberId', verifyToken, requirePermission('Trust Management', 'delete'), trustManagementController.deleteMember);

module.exports = router;
