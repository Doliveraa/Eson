/**
 * user - Mongoose database model for a User
 */

const MONGOOSE = require('mongoose');

const UserSchema = MONGOOSE.Schema({
  email: {
    trim: true,
    type: String,
    required: true,
    index: { unique: true },
  },
  username: {
    trim: true,
    type: String,
    required: true,
    index: { unique: true },
  },
  password: {
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
  },
  firstName: {
    trim: true,
    type: String,
  },
  lastName: {
    trim: true,
    type: String,
  },
  accessToken: {
    trim: true,
    type: String,
  },
  refreshToken: {
    trim: true,
    type: String,
  },
  accessTokenExpiryDate: { type: Number },
});

module.exports =  UserSchema;
