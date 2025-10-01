/**
 * Data Service for Talent Show Application
 * Provides API-based data persistence with fallback to localStorage
 */

class TalentShowDataService {
    constructor() {
        this.apiBaseUrl = '/api';
        this.useLocalStorage = false;
        this.initialized = false;
    }

    /**
     * Initialize the data service
     */
    async init() {
        if (!this.initialized) {
            await this.checkApiAvailability();
            this.initialized = true;
        }
        return this.getPersistenceStatus();
    }

    /**
     * Check if API server is available
     */
    async checkApiAvailability() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/status`);
            if (response.ok) {
                console.log('✅ API server is available - using file-based persistence');
                this.useLocalStorage = false;
                await this.migrateFromLocalStorage();
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.warn('⚠️ API server not available - falling back to localStorage');
            this.useLocalStorage = true;
        }
    }

    /**
     * Migrate existing localStorage data to API
     */
    async migrateFromLocalStorage() {
        const localData = localStorage.getItem('talentShowData');
        if (localData) {
            try {
                const data = JSON.parse(localData);
                console.log('🔄 Migrating data from localStorage to API...');
                
                // Check if API already has data
                const existingData = await this.getAllData();
                if (existingData.events.length === 0 && !existingData.currentEvent) {
                    // Migrate events
                    if (data.items || data.events) {
                        const events = data.items || data.events;
                        for (const event of events) {
                            await this.addEvent(event);
                        }
                    }
                    
                    // Migrate finished events
                    if (data.finishedItems || data.finishedEvents) {
                        const finishedEvents = data.finishedItems || data.finishedEvents;
                        // Note: We can't directly migrate finished events via API
                        // They would need to be added and then finished
                        console.log('Note: Finished events need manual migration');
                    }
                    
                    console.log('✅ Migration completed');
                }
            } catch (error) {
                console.error('Migration failed:', error);
            }
        }
    }

    /**
     * Get all data (events, current event, finished events)
     */
    async getAllData() {
        if (this.useLocalStorage) {
            const data = localStorage.getItem('talentShowData');
            return data ? JSON.parse(data) : {
                events: [],
                currentEvent: null,
                finishedEvents: []
            };
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/data`);
            if (!response.ok) throw new Error('Failed to fetch data');
            return await response.json();
        } catch (error) {
            console.error('API call failed, falling back to localStorage:', error);
            this.useLocalStorage = true;
            return this.getAllData();
        }
    }

    /**
     * Get upcoming events
     */
    async getEvents() {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            return data.events || data.items || [];
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/events`);
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.getEvents();
        }
    }

    /**
     * Get current event
     */
    async getCurrentEvent() {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            return data.currentEvent || data.currentItem;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/current`);
            if (!response.ok) throw new Error('Failed to fetch current event');
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.getCurrentEvent();
        }
    }

    /**
     * Get finished events
     */
    async getFinishedEvents() {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            return data.finishedEvents || data.finishedItems || [];
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/finished`);
            if (!response.ok) throw new Error('Failed to fetch finished events');
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.getFinishedEvents();
        }
    }

    /**
     * Add new event
     */
    async addEvent(eventData) {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const events = data.events || data.items || [];
            
            // Check for duplicate IDs
            const existingIds = events.map(e => e.id);
            if (data.currentEvent) existingIds.push(data.currentEvent.id);
            if (data.finishedEvents) existingIds.push(...data.finishedEvents.map(e => e.id));
            
            if (existingIds.includes(eventData.id)) {
                throw new Error(`Event ID ${eventData.id} already exists`);
            }
            
            events.push(eventData);
            data.events = events;
            data.items = events; // Maintain compatibility
            localStorage.setItem('talentShowData', JSON.stringify(data));
            return { message: 'Event added successfully' };
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.addEvent(eventData);
        }
    }

    /**
     * Update event
     */
    async updateEvent(eventId, eventData) {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const events = data.events || data.items || [];
            const eventIndex = events.findIndex(e => e.id === eventId);
            
            if (eventIndex !== -1) {
                events[eventIndex] = { ...events[eventIndex], ...eventData };
                data.events = events;
                data.items = events; // Maintain compatibility
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Event updated successfully' };
            } else {
                throw new Error('Event not found');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.updateEvent(eventId, eventData);
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const events = data.events || data.items || [];
            const originalLength = events.length;
            
            data.events = events.filter(e => e.id !== eventId);
            data.items = data.events; // Maintain compatibility
            
            if (data.events.length < originalLength) {
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Event deleted successfully' };
            } else {
                throw new Error('Event not found');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/events/${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.deleteEvent(eventId);
        }
    }

    /**
     * Start next event
     */
    async startNextEvent() {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const events = data.events || data.items || [];
            
            if (events.length > 0) {
                data.currentEvent = events.shift();
                data.currentItem = data.currentEvent; // Maintain compatibility
                data.events = events;
                data.items = events; // Maintain compatibility
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Next event started', currentEvent: data.currentEvent };
            } else {
                throw new Error('No events to start');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/start-next`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to start next event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.startNextEvent();
        }
    }

    /**
     * Stop current event and move it back to the top of the queue
     */
    async stopCurrentEvent() {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            
            if (data.currentEvent || data.currentItem) {
                const currentEvent = data.currentEvent || data.currentItem;
                const events = data.events || data.items || [];
                
                // Move current event back to the top of the queue
                events.unshift(currentEvent);
                
                data.events = events;
                data.items = events; // Maintain compatibility
                data.currentEvent = null;
                data.currentItem = null; // Maintain compatibility
                
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Current event stopped and moved back to queue' };
            } else {
                throw new Error('No current event to stop');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/stop-current`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to stop current event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.stopCurrentEvent();
        }
    }

    /**
     * Finish current event
     */
    async finishCurrentEvent() {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            
            if (data.currentEvent || data.currentItem) {
                const currentEvent = data.currentEvent || data.currentItem;
                const finishedEvent = {
                    ...currentEvent,
                    finishedAt: new Date().toISOString()
                };
                
                const finishedEvents = data.finishedEvents || data.finishedItems || [];
                finishedEvents.push(finishedEvent);
                
                data.finishedEvents = finishedEvents;
                data.finishedItems = finishedEvents; // Maintain compatibility
                data.currentEvent = null;
                data.currentItem = null; // Maintain compatibility
                
                // Auto-start next event if available
                const events = data.events || data.items || [];
                if (events.length > 0) {
                    data.currentEvent = events.shift();
                    data.currentItem = data.currentEvent; // Maintain compatibility
                    data.events = events;
                    data.items = events; // Maintain compatibility
                }
                
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Current event finished', currentEvent: data.currentEvent };
            } else {
                throw new Error('No current event to finish');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/finish-current`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to finish current event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.finishCurrentEvent();
        }
    }

    /**
     * Restore finished event
     */
    async restoreFinishedEvent(eventId) {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const finishedEvents = data.finishedEvents || data.finishedItems || [];
            const eventIndex = finishedEvents.findIndex(e => e.id === eventId);
            
            if (eventIndex !== -1) {
                const eventToRestore = finishedEvents.splice(eventIndex, 1)[0];
                delete eventToRestore.finishedAt;
                
                const events = data.events || data.items || [];
                events.push(eventToRestore);
                
                data.events = events;
                data.items = events; // Maintain compatibility
                data.finishedEvents = finishedEvents;
                data.finishedItems = finishedEvents; // Maintain compatibility
                
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Event restored successfully' };
            } else {
                throw new Error('Finished event not found');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: eventId })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to restore event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.restoreFinishedEvent(eventId);
        }
    }

    /**
     * Delete finished event
     */
    async deleteFinishedEvent(eventId) {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const finishedEvents = data.finishedEvents || data.finishedItems || [];
            const originalLength = finishedEvents.length;
            
            data.finishedEvents = finishedEvents.filter(e => e.id !== eventId);
            data.finishedItems = data.finishedEvents; // Maintain compatibility
            
            if (data.finishedEvents.length < originalLength) {
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Finished event deleted successfully' };
            } else {
                throw new Error('Finished event not found');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/finished/${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete finished event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.deleteFinishedEvent(eventId);
        }
    }

    /**
     * Move event position
     */
    async moveEvent(fromIndex, toIndex) {
        if (this.useLocalStorage) {
            const data = await this.getAllData();
            const events = data.events || data.items || [];
            
            if (fromIndex >= 0 && fromIndex < events.length && toIndex >= 0 && toIndex < events.length) {
                const event = events.splice(fromIndex, 1)[0];
                events.splice(toIndex, 0, event);
                
                data.events = events;
                data.items = events; // Maintain compatibility
                localStorage.setItem('talentShowData', JSON.stringify(data));
                return { message: 'Event moved successfully' };
            } else {
                throw new Error('Invalid move indices');
            }
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/move-event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fromIndex, toIndex })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to move event');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.useLocalStorage = true;
            return this.moveEvent(fromIndex, toIndex);
        }
    }

    /**
     * Get persistence status
     */
    getPersistenceStatus() {
        return {
            usingAPI: !this.useLocalStorage,
            apiUrl: this.apiBaseUrl,
            fallbackToLocalStorage: this.useLocalStorage
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TalentShowDataService;
}
