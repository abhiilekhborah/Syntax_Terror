const express = require('express');
const router = express.Router();
const {
  reportIssue,
  getAllIssues,
  updateIssueStatus,
  getIssuesForMap,
  createIssueFromMap
} = require('../controllers/issueController');

const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public — called by Python map (no auth needed)
router.post('/map', createIssueFromMap);
router.get('/map', getIssuesForMap);

// Protected
router.post('/', protect, upload.single('image'), reportIssue);
router.get('/', protect, getAllIssues);
router.patch('/:id/status', protect, roleMiddleware('authority', 'admin'), updateIssueStatus);

module.exports = router;