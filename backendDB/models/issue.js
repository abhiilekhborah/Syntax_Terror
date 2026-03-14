const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['pothole', 'garbage', 'streetlight', 'water_logging', 'open_drain', 'water_supply'],
      required: [true, 'Category is required']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    status: {
      type: String,
      enum: ['reported', 'in_progress', 'resolved'],
      default: 'reported'
    },
    location: {
      address: { type: String, default: '' },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    image: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    source: {
      type: String,
      enum: ['map', 'app'],
      default: 'app'
    }
  },
  { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;