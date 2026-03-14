const Issue = require('../models/issue.js');

const ALLOWED_STATUS = ['reported', 'in_progress', 'resolved'];
const ALLOWED_CATEGORIES = [
  'pothole',
  'garbage',
  'streetlight',
  'water_logging',
  'open_drain',
  'water_supply'
];

// Called by authenticated app users
const reportIssue = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;

    if (!title || !description || !category || !location) {
      res.status(400);
      return res.json({
        message: 'title, description, category and location are required'
      });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      res.status(400);
      return res.json({ message: 'Invalid category' });
    }

    let imagePath;
    if (req.file) {
      const parts = req.file.path.split('uploads');
      imagePath = parts.length > 1 ? `uploads${parts[1].replace(/\\/g, '/')}` : req.file.path;
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      image: imagePath,
      location,
      reportedBy: req.user._id,
      source: 'app'
    });

    res.status(201).json(issue);
  } catch (error) {
    next(error);
  }
};

// Called by Python map backend (no auth)
const createIssueFromMap = async (req, res, next) => {
  try {
    const { latitude, longitude, address, description, issue_type, priority, name, phone } = req.body;

    if (!latitude || !longitude || !issue_type) {
      res.status(400);
      return res.json({ message: 'latitude, longitude and issue_type are required' });
    }

    if (!ALLOWED_CATEGORIES.includes(issue_type)) {
      res.status(400);
      return res.json({ message: 'Invalid issue_type' });
    }

    const issue = await Issue.create({
      title: `${issue_type.replace('_', ' ')} reported via map`,
      description: description || '',
      category: issue_type,
      priority: priority || 'low',
      status: 'reported',
      location: {
        latitude,
        longitude,
        address: address || ''
      },
      name: name || '',
      phone: phone || '',
      source: 'map'
    });

    res.status(201).json({
      message: 'Report saved',
      ticket_id: issue._id,
      issue
    });
  } catch (error) {
    next(error);
  }
};

const getAllIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    next(error);
  }
};

const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !ALLOWED_STATUS.includes(status)) {
      res.status(400);
      return res.json({ message: 'Invalid or missing status' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      res.status(404);
      return res.json({ message: 'Issue not found' });
    }

    issue.status = status;
    const updated = await issue.save();

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const getIssuesForMap = async (req, res, next) => {
  try {
    const issues = await Issue.find(
      { status: { $ne: 'resolved' } },
      'title location status category priority createdAt name'
    ).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reportIssue,
  createIssueFromMap,
  getAllIssues,
  updateIssueStatus,
  getIssuesForMap
};