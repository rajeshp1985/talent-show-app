// Vercel Serverless Function for Talent Show App
// This replaces the Python backend with a more Vercel-optimized solution

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Data file path - use /tmp in serverless environment, public/data locally
const DATA_FILE = process.env.VERCEL 
  ? join('/tmp', 'events-data.json')
  : join(process.cwd(), 'public', 'data', 'events-data.json');

// In-memory cache for Vercel (since /tmp might not persist between invocations)
let memoryCache = null;
let cacheTimestamp = null;

// Initialize data structure
const initializeData = () => ({
  events: [],
  currentEvent: null,
  finishedEvents: [],
  lastUpdated: new Date().toISOString()
});

// Read data from file or memory
const readData = () => {
  try {
    // In Vercel, try memory cache first
    if (process.env.VERCEL && memoryCache && cacheTimestamp) {
      // Use cache if it's less than 1 minute old
      if (Date.now() - cacheTimestamp < 60000) {
        return memoryCache;
      }
    }

    // Try to read from file
    if (existsSync(DATA_FILE)) {
      const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
      
      // Update memory cache
      if (process.env.VERCEL) {
        memoryCache = data;
        cacheTimestamp = Date.now();
      }
      
      return data;
    } else {
      // File doesn't exist, create initial data
      const initialData = initializeData();
      writeData(initialData);
      return initialData;
    }
  } catch (error) {
    console.error('Error reading data:', error);
    
    // Return memory cache if available, otherwise initialize
    if (process.env.VERCEL && memoryCache) {
      return memoryCache;
    }
    
    return initializeData();
  }
};

// Write data to file and memory
const writeData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    
    // Ensure directory exists
    const dir = dirname(DATA_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    // Write to file
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    // Update memory cache
    if (process.env.VERCEL) {
      memoryCache = { ...data };
      cacheTimestamp = Date.now();
    }
    
    console.log('Data written successfully:', { 
      file: DATA_FILE, 
      events: data.events.length, 
      currentEvent: !!data.currentEvent,
      environment: process.env.VERCEL ? 'vercel' : 'local'
    });
    
  } catch (error) {
    console.error('Error writing data:', error);
    
    // At least update memory cache
    if (process.env.VERCEL) {
      memoryCache = { ...data };
      cacheTimestamp = Date.now();
    }
    
    throw error;
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default function handler(req, res) {
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
      const data = readData();
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'vercel' : 'local',
        dataFile: DATA_FILE,
        hasMemoryCache: !!memoryCache,
        cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
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
        const data = readData();
        return res.status(200).json(data);
      }
    }

    if (path === '/api/events') {
      const data = readData();
      
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
        writeData(data);
        return res.status(201).json({ message: 'Event added successfully', event: newEvent });
      }
    }

    if (path.startsWith('/api/events/')) {
      const eventId = path.split('/')[3];
      const data = readData();
      
      if (method === 'PUT') {
        const eventIndex = data.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        data.events[eventIndex] = { ...data.events[eventIndex], ...req.body };
        writeData(data);
        return res.status(200).json({ message: 'Event updated successfully' });
      }
      
      if (method === 'DELETE') {
        const eventIndex = data.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        data.events.splice(eventIndex, 1);
        writeData(data);
        return res.status(200).json({ message: 'Event deleted successfully' });
      }
    }

    if (path === '/api/current') {
      const data = readData();
      if (method === 'GET') {
        return res.status(200).json(data.currentEvent);
      }
    }

    if (path === '/api/start-next') {
      if (method === 'POST') {
        const data = readData();
        
        if (data.events.length === 0) {
          return res.status(400).json({ error: 'No events to start' });
        }
        
        data.currentEvent = data.events.shift();
        writeData(data);
        return res.status(200).json({ 
          message: 'Next event started', 
          currentEvent: data.currentEvent 
        });
      }
    }

    if (path === '/api/finish-current') {
      if (method === 'POST') {
        const data = readData();
        
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
        
        writeData(data);
        return res.status(200).json({ 
          message: 'Current event finished', 
          currentEvent: data.currentEvent 
        });
      }
    }

    if (path === '/api/finished') {
      const data = readData();
      if (method === 'GET') {
        return res.status(200).json(data.finishedEvents);
      }
    }

    if (path.startsWith('/api/finished/')) {
      const eventId = path.split('/')[3];
      const data = readData();
      
      if (method === 'DELETE') {
        const eventIndex = data.finishedEvents.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Finished event not found' });
        }
        
        data.finishedEvents.splice(eventIndex, 1);
        writeData(data);
        return res.status(200).json({ message: 'Finished event deleted successfully' });
      }
    }

    if (path === '/api/restore') {
      if (method === 'POST') {
        const { id } = req.body;
        const data = readData();
        
        const eventIndex = data.finishedEvents.findIndex(e => e.id === id);
        if (eventIndex === -1) {
          return res.status(404).json({ error: 'Finished event not found' });
        }
        
        const eventToRestore = data.finishedEvents.splice(eventIndex, 1)[0];
        delete eventToRestore.finishedAt;
        
        data.events.push(eventToRestore);
        writeData(data);
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
