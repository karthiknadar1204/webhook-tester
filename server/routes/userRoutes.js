import express from 'express';
import { db } from '../config/database.js';
import { users } from '../models/userSchema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();


router.post('/sync', async (req, res) => {
  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({ error: 'Clerk ID, email and name are required' });
    }

    const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

    if (existingUser.length > 0) {
      return res.json({ user: existingUser[0], created: false });
    } else {
      const [newUser] = await db.insert(users).values({
        clerkId,
        email,
        name,
        password: 'clerk-managed',
      }).returning();

      return res.json({ user: newUser, created: true });
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

export default router;
