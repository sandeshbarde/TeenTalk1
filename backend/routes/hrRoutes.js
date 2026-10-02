const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { requireAuth } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

// HR & Super Admin routes
router.use(requireAuth, requireRoles('hr', 'super_admin'));

router.get('/cases', hrController.getCases);
router.get('/cases/:id', hrController.getCaseById);
router.patch('/cases/:id', hrController.updateCase);
router.post('/cases/:id/notes', hrController.addCaseNote);

module.exports = router;
