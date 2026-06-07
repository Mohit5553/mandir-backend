const express = require('express');
const router = express.Router();
const trustManagementController = require('../controllers/trustManagementController');

router.get('/', trustManagementController.getTrustManagement);
router.post('/categories', trustManagementController.addCategory);
router.put('/categories/:categoryId', trustManagementController.updateCategory);
router.delete('/categories/:categoryId', trustManagementController.deleteCategory);

router.post('/roles', trustManagementController.addRole);
router.put('/roles/:roleId', trustManagementController.updateRole);
router.delete('/roles/:roleId', trustManagementController.deleteRole);

router.post('/members', trustManagementController.addMember);
router.put('/members/:memberId', trustManagementController.updateMember);
router.delete('/members/:memberId', trustManagementController.deleteMember);

module.exports = router;
