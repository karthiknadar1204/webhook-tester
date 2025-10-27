import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { bins } from '../models/binSchema.js';
import { Request } from '../models/requestSchema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Create a new bin
router.post('/create', async (req, res) => {
  const binId = uuidv4().slice(0, 8);  // Short random ID, e.g., 'xyz123'
  await db.insert(bins).values({ binId });
  res.json({ binUrl: `https://yourapp.com/bin/${binId}` });
});

// Capture incoming webhook request (public endpoint)
router.all('/:binId', async (req, res) => {
  const { binId } = req.params;
  // Verify bin exists in PG
  const bin = await db.select().from(bins).where(eq(bins.binId, binId));
  if (!bin.length) return res.status(404).send('Bin not found');

  // Capture request data
  const requestData = {
    binId,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    ip: req.ip,
  };

  // Store in Mongo
  const newRequest = new Request(requestData);
  await newRequest.save();

  // Emit real-time update via Socket.io
  req.io.to(binId).emit('newRequest', requestData);

  // Respond with 200 OK to webhook sender
  res.status(200).send('OK');
});

// Get requests for a bin (for dashboard)
router.get('/:binId/requests', async (req, res) => {
  const { binId } = req.params;
  const requests = await Request.find({ binId }).sort({ timestamp: -1 }).limit(50);
  res.json(requests);
});

export default router;