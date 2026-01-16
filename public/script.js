// Talent Show Manager JavaScript

class TalentShowManager {
    constructor() {
        this.items = []; // Combined events and announcements
        this.currentItem = null;
        this.finishedItems = [];
        this.editingItemId = null;
        this.dataService = new TalentShowDataService();
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.bindEvents();
        this.renderHome();
        this.renderManagePage();
        
        // Show persistence status
        const status = this.dataService.getPersistenceStatus();
        console.log('📊 Data Persistence Status:', status);
    }

    // Event Binding
    bindEvents() {
        // Navigation
        document.getElementById('homeBtn').addEventListener('click', () => this.showPage('home'));
        document.getElementById('manageBtn').addEventListener('click', () => this.showPage('manage'));
        document.getElementById('previewBtn').addEventListener('click', () => this.openPreview());
        document.getElementById('projectionBtn').addEventListener('click', () => this.openProjection());

        // Home page buttons
        document.getElementById('startNextBtn').addEventListener('click', () => this.startNextEvent());
        document.getElementById('addEventBtn').addEventListener('click', () => this.showPage('manage'));

        // Manage page buttons
        document.getElementById('addNewEventBtn').addEventListener('click', () => this.showEventForm());
        document.getElementById('importDataBtn').addEventListener('click', () => this.showImportModal());
        document.getElementById('cancelFormBtn').addEventListener('click', () => this.hideEventForm());

        // Import modal buttons
        document.getElementById('closeImportModal').addEventListener('click', () => this.hideImportModal());
        document.getElementById('cancelImportBtn').addEventListener('click', () => this.hideImportModal());
        document.getElementById('uploadFileBtn').addEventListener('click', () => document.getElementById('importFileInput').click());
        document.getElementById('importFileInput').addEventListener('change', (e) => this.handleImportFile(e));
        document.getElementById('importTextArea').addEventListener('input', (e) => this.handleImportText(e));
        document.getElementById('importBtn').addEventListener('click', () => this.performImport());

        // Form submission
        document.getElementById('eventFormElement').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Item type dropdown change
        document.getElementById('itemType').addEventListener('change', () => this.toggleFormFields());
    }

    // Page Navigation
    showPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        if (page === 'home') {
            document.getElementById('homeBtn').classList.add('active');
            document.getElementById('homePage').classList.add('active');
            this.renderHome();
        } else if (page === 'manage') {
            document.getElementById('manageBtn').classList.add('active');
            document.getElementById('managePage').classList.add('active');
            this.renderManagePage();
        }
    }

    // Data Management using API service
    async loadEvents() {
        try {
            const data = await this.dataService.getAllData();
            this.items = data.events || [];
            this.currentItem = data.currentEvent || null;
            this.finishedItems = data.finishedEvents || [];
            
            // Process photo URLs for all loaded events
            this.items = this.items.map(item => {
                if (item.type === 'event' && item.photo) {
                    item.photo = window.imageUrlHandler.processImageUrl(item.photo);
                }
                return item;
            });
            
            // Process photo URL for current event
            if (this.currentItem && this.currentItem.type === 'event' && this.currentItem.photo) {
                this.currentItem.photo = window.imageUrlHandler.processImageUrl(this.currentItem.photo);
            }
            
            // Process photo URLs for finished events
            this.finishedItems = this.finishedItems.map(item => {
                if (item.type === 'event' && item.photo) {
                    item.photo = window.imageUrlHandler.processImageUrl(item.photo);
                }
                return item;
            });
        } catch (error) {
            console.error('Failed to load events:', error);
            // Initialize with sample data if loading fails
            await this.initializeSampleData();
        }
    }

    async saveEvents() {
        // This method is now handled by individual API calls
        // Keep for backward compatibility but no longer needed
        console.log('saveEvents() called - data is automatically persisted via API');
        
        // Maintain localStorage compatibility for projection page
        const events = this.items.filter(item => item.type === 'event');
        localStorage.setItem('talentShowEvents', JSON.stringify(events));
        localStorage.setItem('currentEvent', JSON.stringify(this.currentItem));
        localStorage.setItem('talentShowItems', JSON.stringify(this.items));
        localStorage.setItem('currentItem', JSON.stringify(this.currentItem));
    }

    initializeSampleData() {
        this.items = [
            {
                id: 1,
                type: 'event',
                name: "Magic Show Extravaganza",
                participants: ["David Copperfield Jr.", "Sarah the Mystical"],
                description: "An amazing magic show featuring card tricks, disappearing acts, and mind-bending illusions that will leave the audience speechless.",
                photo: "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='bg1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff9800;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f57c00;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23bg1)'/%3E%3Ccircle cx='150' cy='120' r='40' fill='white' opacity='0.8'/%3E%3Cellipse cx='150' cy='220' rx='60' ry='80' fill='white' opacity='0.8'/%3E%3Ctext x='150' y='270' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle'%3E🎭%3C/text%3E%3C/svg%3E"
            },
            {
                id: 2,
                type: 'announcement',
                description: "Welcome everyone to our annual talent show! Please turn off your mobile devices and enjoy the performances."
            },
            {
                id: 3,
                type: 'event',
                name: "Rock Band Performance",
                participants: ["The Thunder Bolts", "Mike on Drums", "Lisa on Guitar"],
                description: "High-energy rock performance featuring original songs and classic covers that will get everyone on their feet.",
                photo: "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='bg2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e91e63;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%239c27b0;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23bg2)'/%3E%3Ccircle cx='150' cy='120' r='40' fill='white' opacity='0.8'/%3E%3Cellipse cx='150' cy='220' rx='60' ry='80' fill='white' opacity='0.8'/%3E%3Ctext x='150' y='270' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle'%3E🎸%3C/text%3E%3C/svg%3E"
            },
            {
                id: 4,
                type: 'announcement',
                description: "We'll have a 15-minute intermission after the next performance. Refreshments are available in the lobby."
            },
            {
                id: 5,
                type: 'event',
                name: "Contemporary Dance",
                participants: ["Emma Grace", "Dance Collective"],
                description: "A beautiful contemporary dance piece expressing emotions through fluid movements and artistic choreography.",
                photo: "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='bg3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%232196f3;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23009688;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23bg3)'/%3E%3Ccircle cx='150' cy='120' r='40' fill='white' opacity='0.8'/%3E%3Cellipse cx='150' cy='220' rx='60' ry='80' fill='white' opacity='0.8'/%3E%3Ctext x='150' y='270' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle'%3E💃%3C/text%3E%3C/svg%3E"
            }
        ];
        this.currentItem = null;
        this.saveEvents();
    }

    // Item Management using API service
    async addItem(itemData) {
        const newItem = {
            id: itemData.id,
            type: itemData.type,
            description: itemData.description
        };

        if (itemData.type === 'event') {
            newItem.name = itemData.name;
            newItem.participants = itemData.participants.split(',').map(p => p.trim());
            
            // Process the image URL using the image URL handler
            if (itemData.photo && itemData.photo.trim()) {
                newItem.photo = window.imageUrlHandler.processImageUrl(itemData.photo.trim());
            } else {
                newItem.photo = window.imageUrlHandler.getDefaultImage();
            }
        }

        try {
            await this.dataService.addEvent(newItem);
            await this.loadEvents(); // Refresh local data
        } catch (error) {
            throw error;
        }
    }

    async updateItem(id, itemData) {
        const updatedItem = {
            id: id, // Ensure the ID is included in the update
            type: itemData.type,
            description: itemData.description
        };

        if (itemData.type === 'event') {
            updatedItem.name = itemData.name;
            updatedItem.participants = itemData.participants.split(',').map(p => p.trim());
            
            // Process the image URL using the image URL handler
            if (itemData.photo && itemData.photo.trim()) {
                updatedItem.photo = window.imageUrlHandler.processImageUrl(itemData.photo.trim());
            } else {
                updatedItem.photo = window.imageUrlHandler.getDefaultImage();
            }
        }

        try {
            console.log('Updating item with ID:', id, 'data:', updatedItem);
            await this.dataService.updateEvent(id, updatedItem);
            await this.loadEvents(); // Refresh local data
        } catch (error) {
            console.error('Update failed:', error);
            throw error;
        }
    }

    async deleteItem(id) {
        try {
            await this.dataService.deleteEvent(id);
            await this.loadEvents(); // Refresh local data
        } catch (error) {
            throw error;
        }
    }

    async moveItem(fromIndex, toIndex) {
        try {
            await this.dataService.moveEvent(fromIndex, toIndex);
            await this.loadEvents(); // Refresh local data
        } catch (error) {
            throw error;
        }
    }

    async startNextItem() {
        try {
            await this.dataService.startNextEvent();
            await this.loadEvents(); // Refresh local data
            this.renderHome();
            this.renderManagePage();
        } catch (error) {
            console.error('Failed to start next item:', error);
            alert('Failed to start next item: ' + error.message);
        }
    }

    async finishCurrentItem() {
        try {
            await this.dataService.finishCurrentEvent();
            await this.loadEvents(); // Refresh local data
            this.renderHome();
            this.renderManagePage();
        } catch (error) {
            console.error('Failed to finish current item:', error);
            alert('Failed to finish current item: ' + error.message);
        }
    }

    async stopCurrentItem() {
        try {
            await this.dataService.stopCurrentEvent();
            await this.loadEvents(); // Refresh local data
            this.renderHome();
            this.renderManagePage();
        } catch (error) {
            console.error('Failed to stop current item:', error);
            alert('Failed to stop current item: ' + error.message);
        }
    }

    // Legacy method names for backward compatibility
    addEvent(eventData) {
        this.addItem({...eventData, type: 'event'});
    }

    startNextEvent() {
        this.startNextItem();
    }

    finishCurrentEvent() {
        this.finishCurrentItem();
    }

    // Projection functionality
    openProjection() {
        window.open('projection.html', '_blank', 'fullscreen=yes,scrollbars=no,menubar=no,toolbar=no,location=no,status=no');
    }

    // Preview functionality
    openPreview() {
        window.open('preview.html', '_blank', 'width=1200,height=800,scrollbars=no,menubar=no,toolbar=no,location=no,status=no');
    }

    // Finished items management
    async restoreFinishedItem(itemId) {
        try {
            await this.dataService.restoreFinishedEvent(itemId);
            await this.loadEvents(); // Refresh local data
            this.renderManagePage();
            this.renderHome();
        } catch (error) {
            console.error('Failed to restore finished item:', error);
            alert('Failed to restore finished item: ' + error.message);
        }
    }

    async deleteFinishedItem(itemId) {
        try {
            await this.dataService.deleteFinishedEvent(itemId);
            await this.loadEvents(); // Refresh local data
            this.renderManagePage();
        } catch (error) {
            console.error('Failed to delete finished item:', error);
            alert('Failed to delete finished item: ' + error.message);
        }
    }

    // Legacy method names for backward compatibility
    restoreFinishedEvent(eventId) {
        this.restoreFinishedItem(eventId);
    }

    deleteFinishedEvent(eventId) {
        this.deleteFinishedItem(eventId);
    }

    // Rendering Methods
    renderHome() {
        this.renderCurrentItem();
        this.renderUpcomingItems();
    }

    renderCurrentItem() {
        const currentEventCard = document.getElementById('currentEventCard');
        
        if (this.currentItem) {
            if (this.currentItem.type === 'event') {
                currentEventCard.innerHTML = `
                    <div class="current-event-content">
                        <div class="event-photo">
                            <img src="${this.currentItem.photo}" alt="${this.currentItem.name}" onerror="this.src='images/default.jpg'">
                        </div>
                        <div class="event-details">
                            <h3>${this.currentItem.name}</h3>
                            <div class="participants">
                                <strong>Participants:</strong> ${this.currentItem.participants.join(', ')}
                            </div>
                            <div class="description">${this.currentItem.description}</div>
                            <div class="mt-1">
                                <button onclick="talentShow.finishCurrentEvent()" class="btn secondary">Finish Event</button>
                                <button onclick="talentShow.stopCurrentItem()" class="btn warning" style="margin-left: 0.5rem;">Stop Event</button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (this.currentItem.type === 'announcement') {
                currentEventCard.innerHTML = `
                    <div class="current-announcement-content">
                        <div class="announcement-icon">
                            📢
                        </div>
                        <div class="announcement-details">
                            <h3>Announcement</h3>
                            <div class="description">${this.currentItem.description}</div>
                            <div class="mt-1">
                                <button onclick="talentShow.finishCurrentEvent()" class="btn secondary">Finish Announcement</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            currentEventCard.innerHTML = `
                <div class="no-event">
                    <p>No item currently running</p>
                    ${this.items.length > 0 ? 
                        '<button id="startNextBtn" onclick="talentShow.startNextEvent()" class="btn primary">Start Next Item</button>' : 
                        '<p>Add some events or announcements to get started!</p>'
                    }
                </div>
            `;
        }
    }

    renderUpcomingItems() {
        const upcomingEventsList = document.getElementById('upcomingEventsList');
        
        if (this.items.length === 0) {
            upcomingEventsList.innerHTML = `
                <div class="no-events">
                    <p>No upcoming items scheduled</p>
                    <button onclick="talentShow.showPage('manage')" class="btn secondary">Add Items</button>
                </div>
            `;
        } else {
            upcomingEventsList.innerHTML = this.items.map((item, index) => {
                if (item.type === 'event') {
                    const photoUrl = item.photo ? window.imageUrlHandler.processImageUrl(item.photo) : window.imageUrlHandler.getDefaultImage();
                    return `
                        <div class="event-card">
                            <div class="event-card-content">
                                <div class="event-card-thumbnail">
                                    <img src="${photoUrl}" alt="${item.name}" onerror="this.src='images/default.jpg'">
                                </div>
                                <div class="event-card-details">
                                    <h3>${item.name}</h3>
                                    <div class="participants">
                                        <strong>Participants:</strong> ${item.participants.join(', ')}
                                    </div>
                                    <div class="description">${item.description}</div>
                                    <div class="mt-1">
                                        <small>Position: ${index + 1}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (item.type === 'announcement') {
                    return `
                        <div class="event-card announcement">
                            <div class="announcement-icon">📢</div>
                            <h3>Announcement</h3>
                            <div class="description">${item.description}</div>
                            <div class="mt-1">
                                <small>Position: ${index + 1}</small>
                            </div>
                        </div>
                    `;
                }
            }).join('');
        }
    }

    // Legacy method names for backward compatibility
    renderCurrentEvent() {
        this.renderCurrentItem();
    }

    renderUpcomingEvents() {
        this.renderUpcomingItems();
    }

    renderManagePage() {
        const manageEventsList = document.getElementById('manageEventsList');
        
        let currentEventHtml = '';
        
        // Add current event section if there is one
        if (this.currentItem) {
            if (this.currentItem.type === 'event') {
                currentEventHtml = `
                    <div class="current-event-section-manage">
                        <h3>🎪 Currently Running</h3>
                        <div class="manage-event-item current-running" style="border-left: 4px solid #5e72e4; background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);">
                            <div class="current-badge">LIVE</div>
                            <div class="event-info">
                                <h4>${this.currentItem.name}</h4>
                                <div class="participants">Participants: ${this.currentItem.participants.join(', ')}</div>
                                <div class="description">${this.currentItem.description}</div>
                                <small class="position-info">Currently Running</small>
                            </div>
                            <div class="event-actions">
                                <button onclick="talentShow.finishCurrentEvent()" class="btn small primary">Finish Event</button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (this.currentItem.type === 'announcement') {
                currentEventHtml = `
                    <div class="current-event-section-manage">
                        <h3>📢 Currently Running</h3>
                        <div class="manage-event-item announcement current-running" style="border-left: 4px solid #5e72e4; background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);">
                            <div class="current-badge">LIVE</div>
                            <div class="event-info">
                                <h4><span class="item-type-icon">📢</span>Announcement</h4>
                                <div class="description">${this.currentItem.description}</div>
                                <small class="position-info">Currently Running</small>
                            </div>
                            <div class="event-actions">
                                <button onclick="talentShow.finishCurrentEvent()" class="btn small primary">Finish Announcement</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        let upcomingEventsHtml = '';
        if (this.items.length === 0) {
            upcomingEventsHtml = `
                <div class="no-events">
                    <p>No items to manage</p>
                </div>
            `;
        } else {
            upcomingEventsHtml = `
                <div class="upcoming-events-section-manage">
                    <h3>📅 Upcoming Items</h3>
                    ${this.items.map((item, index) => {
                        if (item.type === 'event') {
                            const photoUrl = item.photo ? window.imageUrlHandler.processImageUrl(item.photo) : window.imageUrlHandler.getDefaultImage();
                            return `
                                <div class="manage-event-item" draggable="true" data-index="${index}">
                                    <div class="position-number">${index + 1}</div>
                                    <div class="event-thumbnail">
                                        <img src="${photoUrl}" alt="${item.name}" onerror="this.src='images/default.jpg'">
                                    </div>
                                    <div class="event-info">
                                        <h4>${item.name}</h4>
                                        <div class="participants">Participants: ${item.participants.join(', ')}</div>
                                        <div class="description">${item.description}</div>
                                        <small class="position-info">Position: ${index + 1}</small>
                                    </div>
                                    <div class="event-actions">
                                        <button onclick="talentShow.editItem('${item.id}')" class="btn small warning">Edit</button>
                                        <button onclick="talentShow.deleteItemConfirm('${item.id}')" class="btn small danger">Delete</button>
                                        ${index > 0 ? `<button onclick="talentShow.moveItemUp(${index})" class="btn small secondary">↑</button>` : ''}
                                        ${index < this.items.length - 1 ? `<button onclick="talentShow.moveItemDown(${index})" class="btn small secondary">↓</button>` : ''}
                                    </div>
                                </div>
                            `;
                        } else if (item.type === 'announcement') {
                            return `
                                <div class="manage-event-item announcement" draggable="true" data-index="${index}">
                                    <div class="position-number">${index + 1}</div>
                                    <div class="event-info">
                                        <h4><span class="item-type-icon">📢</span>Announcement</h4>
                                        <div class="description">${item.description}</div>
                                        <small class="position-info">Position: ${index + 1}</small>
                                    </div>
                                    <div class="event-actions">
                                        <button onclick="talentShow.editItem('${item.id}')" class="btn small warning">Edit</button>
                                        <button onclick="talentShow.deleteItemConfirm('${item.id}')" class="btn small danger">Delete</button>
                                        ${index > 0 ? `<button onclick="talentShow.moveItemUp(${index})" class="btn small secondary">↑</button>` : ''}
                                        ${index < this.items.length - 1 ? `<button onclick="talentShow.moveItemDown(${index})" class="btn small secondary">↓</button>` : ''}
                                    </div>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            `;
        }
        
        manageEventsList.innerHTML = currentEventHtml + upcomingEventsHtml;
        
        this.setupDragAndDrop();
        this.renderFinishedItems();
    }

    renderFinishedItems() {
        const finishedEventsList = document.getElementById('finishedEventsList');
        
        if (this.finishedItems.length === 0) {
            finishedEventsList.innerHTML = `
                <div class="no-events">
                    <p>No finished items yet</p>
                </div>
            `;
        } else {
            finishedEventsList.innerHTML = this.finishedItems.map((item, index) => {
                if (item.type === 'event') {
                    return `
                        <div class="finished-event-item">
                            <div class="event-info">
                                <h4>${item.name}</h4>
                                <div class="participants">Participants: ${item.participants.join(', ')}</div>
                                <div class="description">${item.description}</div>
                                <small>Finished: ${new Date(item.finishedAt).toLocaleString()}</small>
                            </div>
                            <div class="event-actions">
                                <button onclick="talentShow.restoreFinishedItem('${item.id}')" class="btn small restore">↶ Restore</button>
                                <button onclick="talentShow.deleteFinishedItemConfirm('${item.id}')" class="btn small danger">Delete</button>
                            </div>
                        </div>
                    `;
                } else if (item.type === 'announcement') {
                    return `
                        <div class="finished-event-item announcement">
                            <div class="event-info">
                                <h4><span class="item-type-icon">📢</span>Announcement</h4>
                                <div class="description">${item.description}</div>
                                <small>Finished: ${new Date(item.finishedAt).toLocaleString()}</small>
                            </div>
                            <div class="event-actions">
                                <button onclick="talentShow.restoreFinishedItem('${item.id}')" class="btn small restore">↶ Restore</button>
                                <button onclick="talentShow.deleteFinishedItemConfirm('${item.id}')" class="btn small danger">Delete</button>
                            </div>
                        </div>
                    `;
                }
            }).join('');
        }
    }

    deleteFinishedItemConfirm(itemId) {
        const item = this.finishedItems.find(e => e.id === itemId);
        const itemName = item.type === 'event' ? item.name : 'Announcement';
        if (item && confirm(`Are you sure you want to permanently delete "${itemName}"?`)) {
            this.deleteFinishedItem(itemId);
            this.renderManagePage();
        }
    }

    // Legacy method names for backward compatibility
    renderFinishedEvents() {
        this.renderFinishedItems();
    }

    deleteFinishedEventConfirm(eventId) {
        this.deleteFinishedItemConfirm(eventId);
    }

    // Form Management
    showItemForm(itemId = null) {
        const form = document.getElementById('eventForm');
        const formTitle = document.getElementById('formTitle');
        
        form.classList.remove('hidden');
        
        if (itemId) {
            const item = this.items.find(e => e.id === itemId);
            if (item) {
                document.getElementById('itemId').value = item.id;
                document.getElementById('itemId').disabled = true; // Disable ID editing for existing items
                
                if (item.type === 'event') {
                    formTitle.textContent = 'Edit Event';
                    document.getElementById('eventName').value = item.name;
                    document.getElementById('participants').value = item.participants.join(', ');
                    document.getElementById('description').value = item.description;
                    document.getElementById('participantPhoto').value = item.photo || '';
                    document.getElementById('itemType').value = 'event';
                } else if (item.type === 'announcement') {
                    formTitle.textContent = 'Edit Announcement';
                    document.getElementById('eventName').value = '';
                    document.getElementById('participants').value = '';
                    document.getElementById('description').value = item.description;
                    document.getElementById('participantPhoto').value = '';
                    document.getElementById('itemType').value = 'announcement';
                }
                this.editingItemId = itemId;
            }
        } else {
            formTitle.textContent = 'Add New Item';
            document.getElementById('eventFormElement').reset();
            document.getElementById('itemType').value = 'event';
            document.getElementById('itemId').disabled = false; // Enable ID editing for new items
            this.editingItemId = null;
        }
        
        this.toggleFormFields();
        this.setupFileUpload();
    }

    // Setup file upload handling
    setupFileUpload() {
        const fileInput = document.getElementById('participantPhotoFile');
        const urlInput = document.getElementById('participantPhoto');
        
        console.log('🔧 Setting up file upload...', { fileInput, urlInput });
        
        if (!fileInput || !urlInput) {
            console.error('❌ File upload elements not found!', { fileInput, urlInput });
            return;
        }
        
        // Remove any existing event listeners to prevent duplicates
        const existingHandler = fileInput._uploadHandler;
        if (existingHandler) {
            fileInput.removeEventListener('change', existingHandler);
        }
        
        // Create the handler function and store reference
        const handleFileUpload = async (e) => {
            const file = e.target.files[0];
            console.log('📁 File selected:', file ? file.name : 'none');
            
            if (file) {
                const helpText = fileInput.parentElement.querySelector('.form-help');
                
                try {
                    // Show uploading status
                    helpText.innerHTML = `Uploading ${file.name}...`;
                    helpText.style.color = '#5e72e4';
                    helpText.style.fontWeight = '500';
                    
                    console.log('🚀 Starting upload for:', file.name);
                    
                    // Create FormData for file upload
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    // Upload the file
                    const response = await fetch('/api/upload-image', {
                        method: 'POST',
                        body: formData
                    });
                    
                    console.log('📡 Upload response status:', response.status);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
                    }
                    
                    const result = await response.json();
                    console.log('✅ Upload result:', result);
                    
                    // Update the URL input with the uploaded file path
                    urlInput.value = result.path;
                    urlInput.placeholder = `Uploaded: ${result.filename}`;
                    
                    // Show success message
                    helpText.innerHTML = `✅ Image uploaded successfully: ${result.filename}`;
                    helpText.style.color = '#28a745';
                    helpText.style.fontWeight = '500';
                    
                    console.log('📸 Image upload successful:', result);
                    
                } catch (error) {
                    console.error('❌ Upload error:', error);
                    
                    // Show error message
                    helpText.innerHTML = `❌ Upload failed: ${error.message}`;
                    helpText.style.color = '#dc3545';
                    helpText.style.fontWeight = '500';
                    
                    // Clear the file input
                    fileInput.value = '';
                }
            }
        };
        
        // Store reference and add the event listener
        fileInput._uploadHandler = handleFileUpload;
        fileInput.addEventListener('change', handleFileUpload);
        
        // Add URL validation and preview
        urlInput.addEventListener('blur', (e) => {
            const url = e.target.value.trim();
            const helpText = urlInput.parentElement.querySelector('.form-help');
            
            if (url) {
                // Auto-convert Imgur gallery URLs to direct image URLs
                if (url.includes('imgur.com/') && !url.includes('i.imgur.com')) {
                    // Extract image ID from various Imgur URL formats
                    let imageId = null;
                    
                    // Format: https://imgur.com/gallery/title-8eCzGOC
                    // Format: https://imgur.com/8eCzGOC
                    // Format: https://imgur.com/a/8eCzGOC
                    const patterns = [
                        /imgur\.com\/gallery\/.*-([a-zA-Z0-9]+)$/,  // Gallery with title
                        /imgur\.com\/a\/([a-zA-Z0-9]+)/,            // Album
                        /imgur\.com\/([a-zA-Z0-9]+)$/                // Direct ID
                    ];
                    
                    for (const pattern of patterns) {
                        const match = url.match(pattern);
                        if (match) {
                            imageId = match[1];
                            break;
                        }
                    }
                    
                    if (imageId) {
                        // Convert to direct image URL (try .jpg first, most common)
                        const directUrl = `https://i.imgur.com/${imageId}.jpg`;
                        urlInput.value = directUrl;
                        helpText.innerHTML = `✅ Converted Imgur gallery URL to direct image link: ${imageId}.jpg<br>If image doesn't load, try changing .jpg to .png or .gif`;
                        helpText.style.color = '#28a745';
                        return;
                    }
                }
                
                // Validate if it's an image URL
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                    const isImageUrl = imageExtensions.some(ext => url.toLowerCase().includes(ext)) || 
                                       url.includes('i.imgur.com') || 
                                       url.includes('googleusercontent.com') ||
                                       url.includes('i.redd.it');
                    
                    if (isImageUrl) {
                        helpText.innerHTML = `✅ Image URL detected. Preview will show in event card.`;
                        helpText.style.color = '#28a745';
                    } else {
                        helpText.innerHTML = `⚠️ URL doesn't appear to be a direct image link. Make sure it ends with .jpg, .png, etc.`;
                        helpText.style.color = '#ff9800';
                    }
                }
            }
        });
        
        console.log('✅ File upload handler attached successfully');
    }

    hideItemForm() {
        document.getElementById('eventForm').classList.add('hidden');
        document.getElementById('eventFormElement').reset();
        this.editingItemId = null;
    }

    toggleFormFields() {
        const itemType = document.getElementById('itemType').value;
        const eventFields = document.querySelectorAll('.event-field');
        
        eventFields.forEach(field => {
            if (itemType === 'event') {
                field.classList.remove('hidden');
                // Make event fields required
                const inputs = field.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    if (input.id === 'eventName' || input.id === 'participants') {
                        input.required = true;
                    }
                });
            } else {
                field.classList.add('hidden');
                // Remove required attribute for hidden fields
                const inputs = field.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.required = false;
                });
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const itemType = document.getElementById('itemType').value;
        const itemId = document.getElementById('itemId').value.trim();
        
        if (!itemId) {
            alert('Please enter an Item ID');
            return;
        }

        const formData = {
            id: itemId,
            type: itemType,
            description: document.getElementById('description').value.trim()
        };

        if (itemType === 'event') {
            formData.name = document.getElementById('eventName').value.trim();
            formData.participants = document.getElementById('participants').value.trim();
            formData.photo = document.getElementById('participantPhoto').value.trim();
            
            if (!formData.name || !formData.participants || !formData.description) {
                alert('Please fill in all required fields for the event');
                return;
            }
        } else {
            if (!formData.description) {
                alert('Please fill in the announcement description');
                return;
            }
        }

        try {
            if (this.editingItemId) {
                await this.updateItem(this.editingItemId, formData);
            } else {
                await this.addItem(formData);
            }

            this.hideItemForm();
            this.renderManagePage();
            this.renderHome();
        } catch (error) {
            alert(error.message);
        }
    }

    // Legacy method names for backward compatibility
    showEventForm(eventId = null) {
        this.showItemForm(eventId);
    }

    hideEventForm() {
        this.hideItemForm();
    }

    // Item Actions
    editItem(id) {
        this.showItemForm(id);
    }

    async deleteItemConfirm(id) {
        const item = this.items.find(e => e.id === id);
        const itemName = item.type === 'event' ? item.name : 'Announcement';
        if (item && confirm(`Are you sure you want to delete "${itemName}"?`)) {
            await this.deleteItem(id);
            this.renderManagePage();
            this.renderHome();
        }
    }

    async moveItemUp(index) {
        if (index > 0 && index < this.items.length) {
            try {
                await this.moveItem(index, index - 1);
                this.renderManagePage();
                this.renderHome();
            } catch (error) {
                console.error('Failed to move item up:', error);
                alert('Failed to move item up: ' + error.message);
            }
        }
    }

    async moveItemDown(index) {
        if (index >= 0 && index < this.items.length - 1) {
            try {
                await this.moveItem(index, index + 1);
                this.renderManagePage();
                this.renderHome();
            } catch (error) {
                console.error('Failed to move item down:', error);
                alert('Failed to move item down: ' + error.message);
            }
        }
    }

    // Legacy method names for backward compatibility
    editEvent(id) {
        this.editItem(id);
    }

    deleteEventConfirm(id) {
        this.deleteItemConfirm(id);
    }

    moveEventUp(index) {
        this.moveItemUp(index);
    }

    moveEventDown(index) {
        this.moveItemDown(index);
    }

    // Drag and Drop Functionality
    setupDragAndDrop() {
        const items = document.querySelectorAll('.manage-event-item');
        
        items.forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragover', this.handleDragOver.bind(this));
            item.addEventListener('drop', this.handleDrop.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.target.closest('.manage-event-item')?.classList.add('drag-over');
    }

    async handleDrop(e) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toElement = e.target.closest('.manage-event-item');
        
        if (toElement) {
            const toIndex = parseInt(toElement.dataset.index);
            if (fromIndex !== toIndex) {
                try {
                    await this.moveItem(fromIndex, toIndex);
                    this.renderManagePage();
                    this.renderHome();
                } catch (error) {
                    console.error('Failed to move item via drag and drop:', error);
                    alert('Failed to move item: ' + error.message);
                }
            }
        }
    }

    handleDragEnd(e) {
        document.querySelectorAll('.manage-event-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
    }

    // Utility Methods
    resetData() {
        if (confirm('Are you sure you want to reset all data? This will delete all events and cannot be undone.')) {
            localStorage.removeItem('talentShowData');
            this.events = [];
            this.currentEvent = null;
            this.renderHome();
            this.renderManagePage();
        }
    }

    exportData() {
        const data = {
            events: this.events,
            currentEvent: this.currentEvent,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'talent-show-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import Modal Management
    showImportModal() {
        const modal = document.getElementById('importModal');
        modal.classList.remove('hidden');
        this.resetImportModal();
    }

    hideImportModal() {
        const modal = document.getElementById('importModal');
        modal.classList.add('hidden');
        this.resetImportModal();
    }

    resetImportModal() {
        document.getElementById('importFileInput').value = '';
        document.getElementById('importTextArea').value = '';
        document.getElementById('importPreview').classList.add('hidden');
        document.getElementById('importBtn').disabled = true;
        this.importData = null;
    }

    // Import File Handling
    handleImportFile(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    this.processImportData(jsonData);
                    document.getElementById('importTextArea').value = JSON.stringify(jsonData, null, 2);
                } catch (error) {
                    alert('Invalid JSON file: ' + error.message);
                    this.resetImportModal();
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid JSON file');
            e.target.value = '';
        }
    }

    // Import Text Handling
    handleImportText(e) {
        const text = e.target.value.trim();
        if (text) {
            try {
                const jsonData = JSON.parse(text);
                this.processImportData(jsonData);
            } catch (error) {
                // Don't show error while typing, just disable import button
                document.getElementById('importPreview').classList.add('hidden');
                document.getElementById('importBtn').disabled = true;
                this.importData = null;
            }
        } else {
            this.resetImportModal();
        }
    }

    // Process Import Data
    processImportData(jsonData) {
        try {
            // Validate the JSON structure
            if (!jsonData || typeof jsonData !== 'object') {
                throw new Error('Invalid data format');
            }

            // Count events and finished events
            const eventsCount = (jsonData.events && Array.isArray(jsonData.events)) ? jsonData.events.length : 0;
            const finishedEventsCount = (jsonData.finishedEvents && Array.isArray(jsonData.finishedEvents)) ? jsonData.finishedEvents.length : 0;

            if (eventsCount === 0 && finishedEventsCount === 0) {
                throw new Error('No events or finished events found in the data');
            }

            // Store the import data
            this.importData = jsonData;

            // Show preview
            const previewDiv = document.getElementById('importPreview');
            const statsDiv = document.getElementById('importStats');
            
            statsDiv.innerHTML = `
                <div><strong>Events to import:</strong> ${eventsCount}</div>
                <div><strong>Finished events to import:</strong> ${finishedEventsCount}</div>
                <div><strong>Current event:</strong> ${jsonData.currentEvent ? 'Yes' : 'None'}</div>
                <div style="margin-top: 1rem; color: #546e7a; font-size: 0.8rem;">
                    Note: Duplicate IDs will be skipped during import
                </div>
            `;
            
            previewDiv.classList.remove('hidden');
            document.getElementById('importBtn').disabled = false;

        } catch (error) {
            alert('Invalid import data: ' + error.message);
            this.resetImportModal();
        }
    }

    // Perform Import
    async performImport() {
        if (!this.importData) {
            alert('No data to import');
            return;
        }

        try {
            const importBtn = document.getElementById('importBtn');
            const originalText = importBtn.textContent;
            
            // Show loading state
            importBtn.disabled = true;
            importBtn.textContent = 'Importing...';

            // Call the import API
            const response = await fetch('/api/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.importData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Import failed');
            }

            const result = await response.json();
            
            // Show success message
            const message = `Import completed successfully!\n\n` +
                `Events added: ${result.stats.eventsAdded}\n` +
                `Events skipped (duplicates): ${result.stats.eventsSkipped}\n` +
                `Finished events added: ${result.stats.finishedEventsAdded}\n` +
                `Finished events skipped (duplicates): ${result.stats.finishedEventsSkipped}\n\n` +
                `Total events: ${result.stats.totalEvents}\n` +
                `Total finished events: ${result.stats.totalFinishedEvents}`;
            
            alert(message);

            // Refresh the data and UI
            await this.loadEvents();
            this.renderHome();
            this.renderManagePage();
            
            // Hide the modal
            this.hideImportModal();

        } catch (error) {
            console.error('Import error:', error);
            alert('Import failed: ' + error.message);
        } finally {
            // Reset button state
            const importBtn = document.getElementById('importBtn');
            importBtn.disabled = false;
            importBtn.textContent = 'Import Data';
        }
    }
}

// Initialize the application
const talentShow = new TalentShowManager();

// Add some utility functions to window for easy access
window.talentShow = talentShow;
