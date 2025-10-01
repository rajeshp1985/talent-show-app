// Standalone Node.js server for local development
// This replaces the need for Vercel CLI during development

import express from 'express';
import multer from 'multer';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Data file path
const DATA_FILE = join(__dirname, 'public', 'data', 'events-data.json');

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

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Ensure images directory exists
const imagesDir = join(__dirname, 'public', 'images');
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename or generate unique name
    const originalName = file.originalname;
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${extension}`, '');
    
    // Use original filename, but ensure it's safe
    const safeFilename = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, safeFilename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// File Upload Route
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.filename;
    const imagePath = `images/${filename}`;
    
    console.log(`📸 Image uploaded successfully: ${filename}`);
    
    res.json({ 
      message: 'Image uploaded successfully',
      filename: filename,
      path: imagePath,
      url: `/${imagePath}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/data', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/events', (req, res) => {
  try {
    const data = readData();
    res.json(data.events);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/events', (req, res) => {
  try {
    const data = readData();
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
    res.status(201).json({ message: 'Event added successfully', event: newEvent });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/events/:id', (req, res) => {
  try {
    const data = readData();
    const eventId = req.params.id;
    const eventIndex = data.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    data.events[eventIndex] = { ...data.events[eventIndex], ...req.body };
    writeData(data);
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  try {
    const data = readData();
    const eventId = req.params.id;
    const eventIndex = data.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    data.events.splice(eventIndex, 1);
    writeData(data);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/current', (req, res) => {
  try {
    const data = readData();
    res.json(data.currentEvent);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/start-next', (req, res) => {
  try {
    const data = readData();
    
    if (data.events.length === 0) {
      return res.status(400).json({ error: 'No events to start' });
    }
    
    data.currentEvent = data.events.shift();
    writeData(data);
    res.json({ 
      message: 'Next event started', 
      currentEvent: data.currentEvent 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/finish-current', (req, res) => {
  try {
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
    res.json({ 
      message: 'Current event finished', 
      currentEvent: data.currentEvent 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/stop-current', (req, res) => {
  try {
    const data = readData();
    
    if (!data.currentEvent) {
      return res.status(400).json({ error: 'No current event to stop' });
    }
    
    // Move current event back to the top of the queue
    data.events.unshift(data.currentEvent);
    data.currentEvent = null;
    
    writeData(data);
    res.json({ 
      message: 'Current event stopped and moved back to queue' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/finished', (req, res) => {
  try {
    const data = readData();
    res.json(data.finishedEvents);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/finished/:id', (req, res) => {
  try {
    const data = readData();
    const eventId = req.params.id;
    const eventIndex = data.finishedEvents.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Finished event not found' });
    }
    
    data.finishedEvents.splice(eventIndex, 1);
    writeData(data);
    res.json({ message: 'Finished event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/restore', (req, res) => {
  try {
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
    res.json({ message: 'Event restored successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/move-event', (req, res) => {
  try {
    const { fromIndex, toIndex } = req.body;
    const data = readData();
    
    console.log(`Move request: from ${fromIndex} to ${toIndex}, events length: ${data.events.length}`);
    
    if (fromIndex < 0 || fromIndex >= data.events.length) {
      return res.status(400).json({ 
        error: `Invalid fromIndex: ${fromIndex} (events length: ${data.events.length})` 
      });
    }
    
    if (toIndex < 0 || toIndex >= data.events.length) {
      return res.status(400).json({ 
        error: `Invalid toIndex: ${toIndex} (events length: ${data.events.length})` 
      });
    }
    
    if (fromIndex === toIndex) {
      return res.json({ message: 'No move needed - same position' });
    }
    
    // Move the event
    const event = data.events.splice(fromIndex, 1)[0];
    data.events.splice(toIndex, 0, event);
    
    console.log(`Event moved successfully from ${fromIndex} to ${toIndex}`);
    writeData(data);
    res.json({ message: 'Event moved successfully' });
  } catch (error) {
    console.error('Move event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Talent Show App running at http://localhost:${PORT}`);
  console.log(`📱 Main App: http://localhost:${PORT}`);
  console.log(`📺 Projection: http://localhost:${PORT}/projection.html`);
  console.log(`🔧 API Status: http://localhost:${PORT}/api/status`);
});
