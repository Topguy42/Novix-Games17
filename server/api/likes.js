import db from '../db.js';
import { randomUUID } from 'crypto';

export async function likeHandler(req, res) {
  const { type, targetId, action } = req.body || {};

  if (!['changelog','feedback'].includes(type) || !targetId) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const userId = req.session?.user?.id || null;

    if (action === 'unlike') {
      if (userId) {
        db.prepare('DELETE FROM likes WHERE type = ? AND target_id = ? AND user_id = ?')
          .run(type, targetId, userId);
      } else {
        db.prepare('DELETE FROM likes WHERE type = ? AND target_id = ? AND user_id IS NULL')
          .run(type, targetId);
      }
      res.json({ message: 'Unliked.' });
    } else {
      const existingLike = userId
        ? db.prepare('SELECT id FROM likes WHERE type = ? AND target_id = ? AND user_id = ?').get(type, targetId, userId)
        : db.prepare('SELECT id FROM likes WHERE type = ? AND target_id = ? AND user_id IS NULL').get(type, targetId);

      if (existingLike) {
        if (userId) {
          db.prepare('DELETE FROM likes WHERE type = ? AND target_id = ? AND user_id = ?')
            .run(type, targetId, userId);
        } else {
          db.prepare('DELETE FROM likes WHERE type = ? AND target_id = ? AND user_id IS NULL')
            .run(type, targetId);
        }
        res.json({ message: 'Unliked.' });
      } else {
        const id = randomUUID();
        const now = Date.now();
        db.prepare('INSERT INTO likes (id, type, target_id, user_id, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(id, type, targetId, userId, now);
        res.status(201).json({ message: 'Liked!' });
      }
    }
  } catch (error) {
    console.error('Like handler error:', error);
    res.status(500).json({ error: 'Failed to process like' });
  }
}

export async function getLikesHandler(req, res) {
  const { type, targetId } = req.query;
  if (!['changelog','feedback'].includes(type) || !targetId) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM likes WHERE type = ? AND target_id = ?').get(type, targetId)?.count || 0;
    console.log(`Like count for ${type}/${targetId}: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: 'Failed to get likes', count: 0 });
  }
}
