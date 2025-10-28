import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { bins, users } from '../models/index.js';
import { Request } from '../models/requestSchema.js';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { clerkId } = req.body;
    
    if (!clerkId) {
      return res.status(400).json({ error: 'Clerk ID is required' });
    }

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const binId = uuidv4().slice(0, 8);
    const [newBin] = await db.insert(bins).values({ binId, userId: user.id }).returning();
    
    res.json({ 
      id: newBin.id,
      binId: newBin.binId,
      binUrl: `http://localhost:3005/bin/${newBin.binId}`,
      createdAt: newBin.createdAt 
    });
  } catch (error) {
    console.error('Error creating bin:', error);
    res.status(500).json({ error: 'Failed to create bin' });
  }
});

router.get('/user/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBins = await db.select().from(bins).where(eq(bins.userId, user.id));
    
    res.json(userBins.map(bin => ({
      id: bin.id,
      binId: bin.binId,
      binUrl: `http://localhost:3005/bin/${bin.binId}`,
      createdAt: bin.createdAt
    })));
  } catch (error) {
    console.error('Error fetching bins:', error);
    res.status(500).json({ error: 'Failed to fetch bins' });
  }
});

router.get('/:binId/requests', async (req, res) => {
  try {
    const { binId } = req.params;
    const requests = await Request.find({ binId }).sort({ timestamp: -1 }).limit(50);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.get('/:binId', async (req, res) => {
  try {
    const { binId } = req.params;
    const [bin] = await db.select().from(bins).where(eq(bins.binId, binId)).limit(1);
    
    if (!bin) {
      return res.status(404).json({ error: 'Bin not found' });
    }

    res.json({
      id: bin.id,
      binId: bin.binId,
      binUrl: `http://localhost:3005/bin/${bin.binId}`,
      createdAt: bin.createdAt
    });
  } catch (error) {
    console.error('Error fetching bin:', error);
    res.status(500).json({ error: 'Failed to fetch bin' });
  }
});

router.all('/:binId', async (req, res) => {
  if (req.path.endsWith('/requests')) {
    return;
  }
  
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

  try {
    const newRequest = new Request(requestData);
    await newRequest.save();
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).send('Error capturing request');
  }
});

export default router;