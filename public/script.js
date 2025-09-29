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
        document.getElementById('projectionBtn').addEventListener('click', () => this.openProjection());

        // Home page buttons
        document.getElementById('startNextBtn').addEventListener('click', () => this.startNextEvent());
        document.getElementById('addEventBtn').addEventListener('click', () => this.showPage('manage'));

        // Manage page buttons
        document.getElementById('addNewEventBtn').addEventListener('click', () => this.showEventForm());
        document.getElementById('cancelFormBtn').addEventListener('click', () => this.hideEventForm());

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
            newItem.photo = itemData.photo || "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='defaultBg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234caf50;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23388e3c;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23defaultBg)'/%3E%3Ccircle cx='150' cy='120' r='40' fill='white' opacity='0.8'/%3E%3Cellipse cx='150' cy='220' rx='60' ry='80' fill='white' opacity='0.8'/%3E%3Ctext x='150' y='270' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle'%3E🎪%3C/text%3E%3C/svg%3E";
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
            type: itemData.type,
            description: itemData.description
        };

        if (itemData.type === 'event') {
            updatedItem.name = itemData.name;
            updatedItem.participants = itemData.participants.split(',').map(p => p.trim());
            updatedItem.photo = itemData.photo;
        }

        try {
            await this.dataService.updateEvent(id, updatedItem);
            await this.loadEvents(); // Refresh local data
        } catch (error) {
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
                            <img src="${this.currentItem.photo}" alt="${this.currentItem.name}" onerror="this.src='data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'errorBg\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23ff5722;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23d32f2f;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'300\' height=\'300\' fill=\'url(%23errorBg)\'/%3E%3Ccircle cx=\'150\' cy=\'120\' r=\'40\' fill=\'white\' opacity=\'0.8\'/%3E%3Cellipse cx=\'150\' cy=\'220\' rx=\'60\' ry=\'80\' fill=\'white\' opacity=\'0.8\'/%3E%3Ctext x=\'150\' y=\'270\' font-family=\'Arial, sans-serif\' font-size=\'32\' fill=\'white\' text-anchor=\'middle\'%3E❌%3C/text%3E%3C/svg%3E'">
                        </div>
                        <div class="event-details">
                            <h3>${this.currentItem.name}</h3>
                            <div class="participants">
                                <strong>Participants:</strong> ${this.currentItem.participants.join(', ')}
                            </div>
                            <div class="description">${this.currentItem.description}</div>
                            <div class="mt-1">
                                <button onclick="talentShow.finishCurrentEvent()" class="btn secondary">Finish Event</button>
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
                    return `
                        <div class="event-card">
                            <h3>${item.name}</h3>
                            <div class="participants">
                                <strong>Participants:</strong> ${item.participants.join(', ')}
                            </div>
                            <div class="description">${item.description}</div>
                            <div class="mt-1">
                                <small>Position: ${index + 1}</small>
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
        
        if (this.items.length === 0) {
            manageEventsList.innerHTML = `
                <div class="no-events">
                    <p>No items to manage</p>
                </div>
            `;
        } else {
            manageEventsList.innerHTML = this.items.map((item, index) => {
                if (item.type === 'event') {
                    return `
                        <div class="manage-event-item" draggable="true" data-index="${index}">
                            <div class="event-info">
                                <h4>${item.name}</h4>
                                <div class="participants">Participants: ${item.participants.join(', ')}</div>
                                <div class="description">${item.description}</div>
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
                            <div class="event-info">
                                <h4><span class="item-type-icon">📢</span>Announcement</h4>
                                <div class="description">${item.description}</div>
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
            }).join('');
        }
        
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
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // For local development, we'll use a simple approach
                // In production, you'd upload to a server or use FileReader for base64
                const fileName = file.name;
                urlInput.value = `images/${fileName}`;
                urlInput.placeholder = `Selected: ${fileName}`;
                
                // Show a message about copying the file
                const helpText = fileInput.parentElement.querySelector('.form-help');
                helpText.innerHTML = `File selected: ${fileName}. Please copy this file to the images/ folder to use it.`;
                helpText.style.color = '#5e72e4';
                helpText.style.fontWeight = '500';
            }
        });
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

    moveItemUp(index) {
        if (index > 0) {
            this.moveItem(index, index - 1);
            this.renderManagePage();
            this.renderHome();
        }
    }

    moveItemDown(index) {
        if (index < this.items.length - 1) {
            this.moveItem(index, index + 1);
            this.renderManagePage();
            this.renderHome();
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

    handleDrop(e) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toElement = e.target.closest('.manage-event-item');
        
        if (toElement) {
            const toIndex = parseInt(toElement.dataset.index);
            if (fromIndex !== toIndex) {
                this.moveEvent(fromIndex, toIndex);
                this.renderManagePage();
                this.renderHome();
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
}

// Initialize the application
const talentShow = new TalentShowManager();

// Add some utility functions to window for easy access
window.talentShow = talentShow;
