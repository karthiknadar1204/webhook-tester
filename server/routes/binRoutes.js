import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { bins } from '../models/binSchema.js';
import { Request } from '../models/requestSchema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.post('/create', async (req, res) => {
  const binId = uuidv4().slice(0, 8);
  await db.insert(bins).values({ binId });
  res.json({ binUrl: `https://yourapp.com/bin/${binId}` });
});

router.all('/:binId', async (req, res) => {
  const { binId } = req.params;
  const bin = await db.select().from(bins).where(eq(bins.binId, binId));
  if (!bin.length) return res.status(404).send('Bin not found');

  const requestData = {
    binId,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    ip: req.ip,
  };

  const newRequest = new Request(requestData);
  await newRequest.save();

  req.io.to(binId).emit('newRequest', requestData);

  res.status(200).send('OK');
});

router.get('/:binId/requests', async (req, res) => {
  const { binId } = req.params;
  const requests = await Request.find({ binId }).sort({ timestamp: -1 }).limit(50);
  res.json(requests);
});

export default router;