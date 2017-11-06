/**
 * user - Mongoose database model for am Assignment
 */

const MONGOOSE = require('mongoose');

const AssignmentSchema = MONGOOSE.Schema({
  title: {
    trim: true,
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  userId: {
    trim: true,
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    trim: true,
    type: String,
    index: {
      unique: true,
      partialFilterExpression: {
        googleId: { $type: 'string' },
      },
    },
  },
  class: {
    trim: true,
    type: String,
  },
  type: {
    trim: true,
    type: String,
  },
  description: {
    trim: true,
    type: String,
  },
});

module.exports = AssignmentSchema;
