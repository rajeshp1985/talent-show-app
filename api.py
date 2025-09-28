#!/usr/bin/env python3
"""
Simple API server for Talent Show data persistence
Provides REST endpoints for managing events data
"""

import json
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class TalentShowAPIHandler(BaseHTTPRequestHandler):
    DATA_FILE = 'events-data.json'
    
    def _set_cors_headers(self):
        """Set CORS headers to allow cross-origin requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def _send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())
    
    def _send_error_response(self, message, status_code=400):
        """Send error response"""
        self._send_json_response({'error': message}, status_code)
    
    def _load_data(self):
        """Load data from JSON file"""
        try:
            if os.path.exists(self.DATA_FILE):
                with open(self.DATA_FILE, 'r') as f:
                    return json.load(f)
            else:
                # Return default structure if file doesn't exist
                return {
                    "events": [],
                    "currentEvent": None,
                    "finishedEvents": [],
                    "lastUpdated": datetime.now().isoformat()
                }
        except Exception as e:
            print(f"Error loading data: {e}")
            return {
                "events": [],
                "currentEvent": None,
                "finishedEvents": [],
                "lastUpdated": datetime.now().isoformat()
            }
    
    def _save_data(self, data):
        """Save data to JSON file"""
        try:
            data['lastUpdated'] = datetime.now().isoformat()
            with open(self.DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving data: {e}")
            return False
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/data':
            # Get all data
            data = self._load_data()
            self._send_json_response(data)
            
        elif path == '/api/events':
            # Get events only
            data = self._load_data()
            self._send_json_response(data.get('events', []))
            
        elif path == '/api/current':
            # Get current event
            data = self._load_data()
            self._send_json_response(data.get('currentEvent'))
            
        elif path == '/api/finished':
            # Get finished events
            data = self._load_data()
            self._send_json_response(data.get('finishedEvents', []))
            
        elif path == '/api/status':
            # Health check
            self._send_json_response({
                'status': 'ok',
                'timestamp': datetime.now().isoformat()
            })
            
        else:
            self._send_error_response('Endpoint not found', 404)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Handle endpoints that don't require JSON data
        if path in ['/api/start-next', '/api/finish-current']:
            request_data = {}
        else:
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    post_data = self.rfile.read(content_length)
                    request_data = json.loads(post_data.decode())
                else:
                    request_data = {}
            except Exception as e:
                self._send_error_response(f'Invalid JSON data: {e}')
                return
        
        data = self._load_data()
        
        if path == '/api/events':
            # Add new event
            if 'id' not in request_data:
                self._send_error_response('Event ID is required')
                return
            
            # Check for duplicate IDs
            existing_ids = [e['id'] for e in data['events']]
            if data['currentEvent']:
                existing_ids.append(data['currentEvent']['id'])
            existing_ids.extend([e['id'] for e in data.get('finishedEvents', [])])
            
            if request_data['id'] in existing_ids:
                self._send_error_response(f'Event ID {request_data["id"]} already exists')
                return
            
            data['events'].append(request_data)
            if self._save_data(data):
                self._send_json_response({'message': 'Event added successfully'})
            else:
                self._send_error_response('Failed to save data', 500)
                
        elif path == '/api/start-next':
            # Start next event
            if data['events']:
                data['currentEvent'] = data['events'].pop(0)
                if self._save_data(data):
                    self._send_json_response({'message': 'Next event started', 'currentEvent': data['currentEvent']})
                else:
                    self._send_error_response('Failed to save data', 500)
            else:
                self._send_error_response('No events to start')
                
        elif path == '/api/finish-current':
            # Finish current event
            if data['currentEvent']:
                finished_event = data['currentEvent'].copy()
                finished_event['finishedAt'] = datetime.now().isoformat()
                
                # Ensure finishedEvents exists
                if 'finishedEvents' not in data:
                    data['finishedEvents'] = []
                
                data['finishedEvents'].append(finished_event)
                data['currentEvent'] = None
                
                # Auto-start next event if available
                if data['events']:
                    data['currentEvent'] = data['events'].pop(0)
                
                if self._save_data(data):
                    self._send_json_response({
                        'message': 'Current event finished',
                        'currentEvent': data['currentEvent']
                    })
                else:
                    self._send_error_response('Failed to save data', 500)
            else:
                self._send_error_response('No current event to finish')
                
        elif path == '/api/restore':
            # Restore finished event
            event_id = request_data.get('id')
            if not event_id:
                self._send_error_response('Event ID is required')
                return
            
            # Find and remove from finished events
            event_to_restore = None
            for i, event in enumerate(data.get('finishedEvents', [])):
                if event['id'] == event_id:
                    event_to_restore = data['finishedEvents'].pop(i)
                    break
            
            if event_to_restore:
                # Remove finished timestamp
                if 'finishedAt' in event_to_restore:
                    del event_to_restore['finishedAt']
                data['events'].append(event_to_restore)
                
                if self._save_data(data):
                    self._send_json_response({'message': 'Event restored successfully'})
                else:
                    self._send_error_response('Failed to save data', 500)
            else:
                self._send_error_response('Event not found in finished events')
        
        else:
            self._send_error_response('Endpoint not found', 404)
    
    def do_PUT(self):
        """Handle PUT requests"""
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.split('/')
        
        if len(path_parts) < 4 or path_parts[1] != 'api' or path_parts[2] != 'events':
            self._send_error_response('Invalid endpoint', 404)
            return
        
        event_id = path_parts[3]  # Keep as string, don't convert to int
        
        try:
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            request_data = json.loads(put_data.decode())
        except Exception as e:
            self._send_error_response(f'Invalid JSON data: {e}')
            return
        
        data = self._load_data()
        
        # Find and update event
        event_updated = False
        for i, event in enumerate(data['events']):
            if event['id'] == event_id:
                data['events'][i] = {**event, **request_data}
                event_updated = True
                break
        
        if event_updated:
            if self._save_data(data):
                self._send_json_response({'message': 'Event updated successfully'})
            else:
                self._send_error_response('Failed to save data', 500)
        else:
            self._send_error_response('Event not found', 404)
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.split('/')
        
        if len(path_parts) < 4 or path_parts[1] != 'api':
            self._send_error_response('Invalid endpoint', 404)
            return
        
        event_id = path_parts[3]  # Keep as string, don't convert to int
        data = self._load_data()
        
        if path_parts[2] == 'events':
            # Delete from upcoming events
            original_length = len(data['events'])
            data['events'] = [e for e in data['events'] if e['id'] != event_id]
            
            if len(data['events']) < original_length:
                if self._save_data(data):
                    self._send_json_response({'message': 'Event deleted successfully'})
                else:
                    self._send_error_response('Failed to save data', 500)
            else:
                self._send_error_response('Event not found', 404)
                
        elif path_parts[2] == 'finished':
            # Delete from finished events
            original_length = len(data.get('finishedEvents', []))
            data['finishedEvents'] = [e for e in data.get('finishedEvents', []) if e['id'] != event_id]
            
            if len(data['finishedEvents']) < original_length:
                if self._save_data(data):
                    self._send_json_response({'message': 'Finished event deleted successfully'})
                else:
                    self._send_error_response('Failed to save data', 500)
            else:
                self._send_error_response('Finished event not found', 404)
        else:
            self._send_error_response('Invalid endpoint', 404)

def run_api_server(port=8001):
    """Run the API server"""
    server = HTTPServer(('localhost', port), TalentShowAPIHandler)
    print(f"Talent Show API server running on http://localhost:{port}")
    print("Available endpoints:")
    print("  GET  /api/data     - Get all data")
    print("  GET  /api/events   - Get upcoming events")
    print("  GET  /api/current  - Get current event")
    print("  GET  /api/finished - Get finished events")
    print("  POST /api/events   - Add new event")
    print("  POST /api/start-next - Start next event")
    print("  POST /api/finish-current - Finish current event")
    print("  POST /api/restore  - Restore finished event")
    print("  PUT  /api/events/{id} - Update event")
    print("  DELETE /api/events/{id} - Delete event")
    print("  DELETE /api/finished/{id} - Delete finished event")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down API server...")
        server.shutdown()

if __name__ == '__main__':
    run_api_server()
