const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, requirePermission } = require('../middleware/authMiddleware');
const { roleRules } = require('../middleware/validationMiddleware');

router.get('/', verifyToken, requirePermission('Roles', 'view'), roleController.getAllRoles);
router.post('/', verifyToken, requirePermission('Roles', 'create'), roleRules, roleController.createRole);
router.put('/:id', verifyToken, requirePermission('Roles', 'update'), roleRules, roleController.updateRole);
router.delete('/:id', verifyToken, requirePermission('Roles', 'delete'), roleController.deleteRole);

module.exports = router;
