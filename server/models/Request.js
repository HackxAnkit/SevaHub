const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    default: 'new',
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    default: '',
    trim: true,
  },
  message: {
    type: String,
    default: '',
    trim: true,
  },
  preferredDate: {
    type: String,
    default: '',
    trim: true,
  },
  budget: {
    type: String,
    default: '',
    trim: true,
  },
  serviceId: {
    type: String,
    default: null,
    trim: true,
  },
  serviceTitle: {
    type: String,
    default: null,
    trim: true,
  },
  serviceCategory: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
})

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema)
