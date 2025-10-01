// Vercel Serverless Function with Redis Database Integration
// This version uses Redis for persistent data storage

import { createClient } from 'redis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Data keys for Redis storage
const DATA_KEYS = {
  EVENTS: 'talent-show:events',
  CURRENT_EVENT: 'talent-show:current-event',
  FINISHED_EVENTS: 'talent-show:finished-events',
  LAST_UPDATED: 'talent-show:last-updated'
};

// Redis client instance
let redisClient = null;

// Initialize Redis client
const getRedisClient = async () => {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });
      
      await redisClient.connect();
      console.log('Redis client connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      redisClient = null;
    }
  }
  return redisClient;
};

// Initialize data structure
const initializeData = () => ({
  events: [],
  currentEvent: null,
  finishedEvents: [],
  lastUpdated: new Date().toISOString()
});

// Bootstrap data from events-data.json
const getBootstrapData = () => {
  try {
    // In Vercel, the file path needs to be relative to the project root
    const filePath = process.env.VERCEL 
      ? join(process.cwd(), 'public', 'data', 'events-data.json')
      : join(process.cwd(), 'public', 'data', 'events-data.json');
    
    console.log('Reading bootstrap data from:', filePath);
    const fileContent = readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    console.log('Bootstrap data loaded successfully:', {
      events: jsonData.events?.length || 0,
      finishedEvents: jsonData.finishedEvents?.length || 0
    });
    
    return jsonData;
  } catch (error) {
    console.error('Error reading events-data.json:', error);
    console.log('Falling back to empty data structure');
    
    // Fallback to empty structure if file can't be read
    return {
      events: [],
      currentEvent: null,
      finishedEvents: [],
      lastUpdated: new Date().toISOString()
    };
  }
};

// Check if database is empty
const isDatabaseEmpty = async () => {
  try {
    const client = await getRedisClient();
    
    if (!client) {
      return true; // Consider empty if Redis not available
    }

    const [events, currentEvent, finishedEvents] = await Promise.all([
      client.get(DATA_KEYS.EVENTS),
      client.get(DATA_KEYS.CURRENT_EVENT),
      client.get(DATA_KEYS.FINISHED_EVENTS)
    ]);

    // Database is empty if all key data structures are null/empty
    const eventsEmpty = !events || JSON.parse(events).length === 0;
    const currentEventEmpty = !currentEvent;
    const finishedEventsEmpty = !finishedEvents || JSON.parse(finishedEvents).length === 0;

    return eventsEmpty && currentEventEmpty && finishedEventsEmpty;
  } catch (error) {
    console.error('Error checking if database is empty:', error);
    return true; // Consider empty on error to trigger bootstrap
  }
};

// Bootstrap database with initial data
const bootstrapDatabase = async () => {
  try {
    console.log('Bootstrapping database with initial data...');
    const bootstrapData = getBootstrapData();
    await writeData(bootstrapData);
    console.log('Database bootstrapped successfully with', {
      events: bootstrapData.events.length,
      finishedEvents: bootstrapData.finishedEvents.length
    });
    return bootstrapData;
  } catch (error) {
    console.error('Error bootstrapping database:', error);
    throw error;
  }
};

// Read data from Redis store with auto-bootstrap
const readData = async () => {
  try {
    const client = await getRedisClient();
    
    // Check if Redis is available
    if (!client) {
      console.log('Redis not available, using fallback data');
      return initializeData();
    }

    // Check if database is empty and bootstrap if needed
    if (await isDatabaseEmpty()) {
      console.log('Database is empty, bootstrapping with initial data...');
      return await bootstrapDatabase();
    }

    const [events, currentEvent, finishedEvents, lastUpdated] = await Promise.all([
      client.get(DATA_KEYS.EVENTS),
      client.get(DATA_KEYS.CURRENT_EVENT),
      client.get(DATA_KEYS.FINISHED_EVENTS),
      client.get(DATA_KEYS.LAST_UPDATED)
    ]);

    return {
      events: events ? JSON.parse(events) : [],
      currentEvent: currentEvent ? JSON.parse(currentEvent) : null,
      finishedEvents: finishedEvents ? JSON.parse(finishedEvents) : [],
      lastUpdated: lastUpdated || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return initializeData();
  }
};

// Write data to Redis store
const writeData = async (data) => {
  try {
    const client = await getRedisClient();
    
    if (!client) {
      console.log('Redis not available, skipping write');
      return;
    }

    data.lastUpdated = new Date().toISOString();

    // Write all data to Redis store
    await Promise.all([
      client.set(DATA_KEYS.EVENTS, JSON.stringify(data.events)),
      client.set(DATA_KEYS.CURRENT_EVENT, JSON.stringify(data.currentEvent)),
      client.set(DATA_KEYS.FINISHED_EVENTS, JSON.stringify(data.finishedEvents)),
      client.set(DATA_KEYS.LAST_UPDATED, data.lastUpdated)
    ]);

    console.log('Data written to Redis successfully:', {
      events: data.events.length,
      currentEvent: !!data.currentEvent,
      finishedEvents: data.finishedEvents.length
    });
  } catch (error) {
    console.error('Error writing to Redis:', error);
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
      const client = await getRedisClient();
      
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'vercel' : 'local',
        storage: client ? 'redis' : 'fallback',
        redisAvailable: !!client,
        redisUrl: process.env.REDIS_URL ? 'configured' : 'missing',
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

    if (path === '/api/stop-current') {
      if (method === 'POST') {
        const data = await readData();

        if (!data.currentEvent) {
          return res.status(400).json({ error: 'No current event to stop' });
        }

        // Move current event back to the top of the queue
        data.events.unshift(data.currentEvent);
        data.currentEvent = null;

        await writeData(data);
        return res.status(200).json({
          message: 'Current event stopped and moved back to queue'
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

    if (path === '/api/bootstrap') {
      if (method === 'POST') {
        try {
          const { force } = req.body;
          
          // Check if database is empty or force bootstrap is requested
          const isEmpty = await isDatabaseEmpty();
          
          if (!isEmpty && !force) {
            return res.status(400).json({ 
              error: 'Database is not empty. Use force=true to override existing data.',
              currentData: await readData()
            });
          }

          const bootstrapData = await bootstrapDatabase();
          return res.status(200).json({
            message: 'Database bootstrapped successfully',
            bootstrapped: true,
            forced: !!force,
            data: bootstrapData
          });
        } catch (error) {
          console.error('Bootstrap error:', error);
          return res.status(500).json({ error: 'Failed to bootstrap database' });
        }
      }

      if (method === 'GET') {
        const isEmpty = await isDatabaseEmpty();
        return res.status(200).json({
          databaseEmpty: isEmpty,
          canBootstrap: isEmpty,
          bootstrapData: getBootstrapData()
        });
      }
    }

    // Route not found
    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
