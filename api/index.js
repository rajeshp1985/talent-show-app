// Vercel Serverless Function for Talent Show App
// This replaces the Python backend with a more Vercel-optimized solution

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Data file path
const DATA_FILE = join(process.cwd(), 'data', 'events-data.json');

// Initialize data structure
const initializeData = () => ({
  events: [],
  currentEvent: null,
  finishedEvents: [],
  lastUpdated: new Date().toISOString()
});

// Read data from file
const readData = () => {
  try {
    if (!existsSync(DATA_FILE)) {
      const initialData = initializeData();
      writeData(initialData);
      return initialData;
    }
    const data = readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return initializeData();
  }
};

// Write data to file
const writeData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
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
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
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
