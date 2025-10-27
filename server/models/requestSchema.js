import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  binId: { type: String, required: true },
  method: String,
  headers: Object,
  body: mongoose.Mixed,
  query: Object,
  ip: String,
  timestamp: { type: Date, default: Date.now },
});

export const Request = mongoose.model('Request', requestSchema);