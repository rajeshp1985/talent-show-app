// Vercel Serverless Function with KV Database Integration
// This version uses Vercel KV (Redis) for persistent data storage

import { kv } from '@vercel/kv';

// Data keys for KV storage
const DATA_KEYS = {
  EVENTS: 'talent-show:events',
  CURRENT_EVENT: 'talent-show:current-event',
  FINISHED_EVENTS: 'talent-show:finished-events',
  LAST_UPDATED: 'talent-show:last-updated'
};

// Initialize data structure
const initializeData = () => ({
  events: [],
  currentEvent: null,
  finishedEvents: [],
  lastUpdated: new Date().toISOString()
});

// Read data from KV store
const readData = async () => {
  try {
    // Check if we're in Vercel environment with KV available
    if (!process.env.KV_REST_API_URL) {
      console.log('KV not available, using fallback data');
      return initializeData();
    }

    const [events, currentEvent, finishedEvents, lastUpdated] = await Promise.all([
      kv.get(DATA_KEYS.EVENTS),
      kv.get(DATA_KEYS.CURRENT_EVENT),
      kv.get(DATA_KEYS.FINISHED_EVENTS),
      kv.get(DATA_KEYS.LAST_UPDATED)
    ]);

    return {
      events: events || [],
      currentEvent: currentEvent || null,
      finishedEvents: finishedEvents || [],
      lastUpdated: lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error reading from KV:', error);
    return initializeData();
  }
};

// Write data to KV store
const writeData = async (data) => {
  try {
    if (!process.env.KV_REST_API_URL) {
      console.log('KV not available, skipping write');
      return;
    }

    data.lastUpdated = new Date().toISOString();

    // Write all data to KV store
    await Promise.all([
      kv.set(DATA_KEYS.EVENTS, data.events),
      kv.set(DATA_KEYS.CURRENT_EVENT, data.currentEvent),
      kv.set(DATA_KEYS.FINISHED_EVENTS, data.finishedEvents),
      kv.set(DATA_KEYS.LAST_UPDATED, data.lastUpdated)
    ]);

    console.log('Data written to KV successfully:', {
      events: data.events.length,
      currentEvent: !!data.currentEvent,
      finishedEvents: data.finishedEvents.length
    });
  } catch (error) {
    console.error('Error writing to KV:', error);
    throw error;
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { method, url } = req;
  const path = url.split('?')[0];

  try {
    // Route handling
    if (path === '/api/status') {
      const data = await readData();
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'vercel' : 'local',
        storage: process.env.KV_REST_API_URL ? 'kv' : 'fallback',
        kvAvailable: !!process.env.KV_REST_API_URL,
        dataStats: {
          events: data.events.length,
          currentEvent: !!data.currentEvent,
          finishedEvents: data.finishedEvents.length,
          lastUpdated: data.lastUpdated
        }
      });
    }

    if (path === '/api/data') {
      if (method === 'GET') {
        const data = await readData();
        return res.status(200).json(data);
      }
    }

    if (path === '/api/events') {
      const data = await readData();

      if (method === 'GET') {
        return res.status(200).json(data.events);
      }

      if (method === 'POST') {
        const newEvent = req.body;

        // Validate required fields
        if (!newEvent.id || !newEvent.type) {
          return res.status(400).json({ error: 'Missing required fields: id, type' });
        }

        // Check for duplicate IDs
        const allIds = [
          ...data.events.map(e => e.id),
          ...(data.currentEvent ? [data.currentEvent.id] : []),
          ...data.finishedEvents.map(e => e.id)
        ];

        if (allIds.includes(newEvent.id)) {
          return res.status(400).json({ error: `Event ID ${newEvent.id} already exists` });
        }

        data.events.push(newEvent);
        await writeData(data);
        return res.status(201).json({ message: 'Event added successfully', event: newEvent });
      }
    }

    if (path.startsWith('/api/events/')) {
      const eventId = path.split('/')[3];
      const data = await readData();

      if (method === 'PUT') {
        const eventIndex = data.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Event not found' });
        }

        data.events[eventIndex] = { ...data.events[eventIndex], ...req.body };
        await writeData(data);
        return res.status(200).json({ message: 'Event updated successfully' });
      }

      if (method === 'DELETE') {
        const eventIndex = data.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Event not found' });
        }

        data.events.splice(eventIndex, 1);
        await writeData(data);
        return res.status(200).json({ message: 'Event deleted successfully' });
      }
    }

    if (path === '/api/current') {
      const data = await readData();
      if (method === 'GET') {
        return res.status(200).json(data.currentEvent);
      }
    }

    if (path === '/api/start-next') {
      if (method === 'POST') {
        const data = await readData();

        if (data.events.length === 0) {
          return res.status(400).json({ error: 'No events to start' });
        }

        data.currentEvent = data.events.shift();
        await writeData(data);
        return res.status(200).json({
          message: 'Next event started',
          currentEvent: data.currentEvent
        });
      }
    }

    if (path === '/api/finish-current') {
      if (method === 'POST') {
        const data = await readData();

        if (!data.currentEvent) {
          return res.status(400).json({ error: 'No current event to finish' });
        }

        const finishedEvent = {
          ...data.currentEvent,
          finishedAt: new Date().toISOString()
        };

        data.finishedEvents.push(finishedEvent);
        data.currentEvent = null;

        // Auto-start next event if available
        if (data.events.length > 0) {
          data.currentEvent = data.events.shift();
        }

        await writeData(data);
        return res.status(200).json({
          message: 'Current event finished',
          currentEvent: data.currentEvent
        });
      }
    }

    if (path === '/api/finished') {
      const data = await readData();
      if (method === 'GET') {
        return res.status(200).json(data.finishedEvents);
      }
    }

    if (path.startsWith('/api/finished/')) {
      const eventId = path.split('/')[3];
      const data = await readData();

      if (method === 'DELETE') {
        const eventIndex = data.finishedEvents.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Finished event not found' });
        }

        data.finishedEvents.splice(eventIndex, 1);
        await writeData(data);
        return res.status(200).json({ message: 'Finished event deleted successfully' });
      }
    }

    if (path === '/api/restore') {
      if (method === 'POST') {
        const { id } = req.body;
        const data = await readData();

        const eventIndex = data.finishedEvents.findIndex(e => e.id === id);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Finished event not found' });
        }

        const eventToRestore = data.finishedEvents.splice(eventIndex, 1)[0];
        delete eventToRestore.finishedAt;

        data.events.push(eventToRestore);
        await writeData(data);
        return res.status(200).json({ message: 'Event restored successfully' });
      }
    }

    // Route not found
    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
