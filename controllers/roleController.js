const Role = require('../models/Role');
const { logAudit } = require('../services/auditService');

const ALL_MENUS = [
  'Dashboard', 'Users', 'Roles', 'Trust Management', 'Donations',
  'Events', 'News', 'Gallery', 'Home Carousel', 'Homepage Content',
  'Volunteer Requests', 'Live Stream', 'Notifications', 'Contact Messages', 'Reports',
  'Reviews', 'Audit Logs'
];

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Role name is required.' });
    }
    // Ensure all menus are represented in permissions
    const merged = ALL_MENUS.map(menu => {
      const p = (permissions || []).find(x => x.menu === menu);
      return { menu, view: p?.view || false, create: p?.create || false, update: p?.update || false, delete: p?.delete || false };
    });
    const role = new Role({ name: name.trim(), permissions: merged });
    await role.save();

    await logAudit({
      req,
      action: 'ROLE_CREATION',
      details: { roleName: role.name, permissions: merged }
    });

    res.status(201).json(role);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A role with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const merged = ALL_MENUS.map(menu => {
      const p = (permissions || []).find(x => x.menu === menu);
      return { menu, view: p?.view || false, create: p?.create || false, update: p?.update || false, delete: p?.delete || false };
    });
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), permissions: merged },
      { new: true }
    );
    if (!role) return res.status(404).json({ message: 'Role not found.' });

    await logAudit({
      req,
      action: 'ROLE_UPDATE',
      details: { roleId: req.params.id, roleName: role.name, permissions: merged }
    });

    res.status(200).json(role);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A role with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found.' });

    await Role.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'ROLE_DELETION',
      details: { roleId: req.params.id, roleName: role.name }
    });

    res.status(200).json({ message: 'Role deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.ALL_MENUS = ALL_MENUS;
