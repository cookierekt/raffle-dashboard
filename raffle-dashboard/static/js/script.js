class RaffleDashboard {
    constructor() {
        this.employees = {};
        this.currentEmployee = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadEmployees();
        this.updateDateInfo();
    }

    bindEvents() {
        // Add employee form
        document.getElementById('add-employee-btn').addEventListener('click', () => this.addEmployee());
        document.getElementById('employee-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addEmployee();
        });

        // Control buttons
        document.getElementById('start-raffle-btn').addEventListener('click', () => this.openRaffleModal());
        document.getElementById('import-excel-btn').addEventListener('click', () => this.openExcelImportModal());
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadEmployees());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetData());

        // Modal events
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('close-excel-modal').addEventListener('click', () => this.closeExcelModal());
        document.getElementById('close-raffle-modal').addEventListener('click', () => this.closeRaffleModal());
        document.getElementById('add-entry-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('add-entry-modal')) {
                this.closeModal();
            }
        });
        document.getElementById('excel-import-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('excel-import-modal')) {
                this.closeExcelModal();
            }
        });
        document.getElementById('raffle-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('raffle-modal')) {
                this.closeRaffleModal();
            }
        });

        // Raffle events
        document.getElementById('spin-wheel-btn').addEventListener('click', () => this.spinWheel());
        document.getElementById('new-raffle-btn').addEventListener('click', () => this.resetRaffle());

        // Excel import events
        document.getElementById('browse-file-btn').addEventListener('click', () => {
            document.getElementById('excel-file').click();
        });
        document.getElementById('excel-file').addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('upload-btn').addEventListener('click', () => this.uploadExcelFile());

        // Drag and drop
        const uploadArea = document.getElementById('upload-area');
        uploadArea.addEventListener('click', () => document.getElementById('excel-file').click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Entry buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('entry-btn')) {
                const entries = parseInt(e.target.dataset.entries);
                const activity = e.target.dataset.activity;
                this.addEntryToEmployee(this.currentEmployee, activity, entries);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeExcelModal();
                this.closeRaffleModal();
            }
        });
    }

    openRaffleModal() {
        const eligibleEmployees = Object.entries(this.employees).filter(([name, data]) => data.entries > 0);
        
        if (eligibleEmployees.length === 0) {
            this.showAlert('No employees with raffle entries found. Add some entries first!', 'error');
            return;
        }
        
        document.getElementById('raffle-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.setupRaffle(eligibleEmployees);
    }

    closeRaffleModal() {
        document.getElementById('raffle-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetRaffle();
    }

    setupRaffle(eligibleEmployees) {
        const totalEntries = eligibleEmployees.reduce((sum, [name, data]) => sum + data.entries, 0);
        
        // Update stats
        document.getElementById('raffle-participants').textContent = eligibleEmployees.length;
        document.getElementById('raffle-total-entries').textContent = totalEntries;
        
        // Create participants list
        const participantsGrid = document.getElementById('participants-grid');
        participantsGrid.innerHTML = eligibleEmployees.map(([name, data]) => {
            const chance = ((data.entries / totalEntries) * 100).toFixed(1);
            return `
                <div class="participant-item">
                    <div class="participant-name">${this.escapeHtml(name)}</div>
                    <div class="participant-entries">${data.entries} entries</div>
                    <div class="participant-chance">${chance}% chance</div>
                </div>
            `;
        }).join('');
        
        // Reset wheel and controls
        document.getElementById('raffle-result').style.display = 'none';
        document.getElementById('spin-wheel-btn').style.display = 'block';
        document.getElementById('spin-wheel-btn').disabled = false;
        document.getElementById('spin-wheel-btn').innerHTML = '<i class="fas fa-play"></i> Spin the Wheel!';
        
        // Reset wheel rotation
        const wheel = document.getElementById('raffle-wheel');
        wheel.classList.remove('wheel-spinning');
        wheel.style.transform = 'rotate(0deg)';
        
        this.raffleData = {
            participants: eligibleEmployees,
            totalEntries: totalEntries,
            isSpinning: false
        };
    }

    spinWheel() {
        if (this.raffleData.isSpinning) return;
        
        this.raffleData.isSpinning = true;
        const spinBtn = document.getElementById('spin-wheel-btn');
        spinBtn.disabled = true;
        spinBtn.innerHTML = '<div class="loading"></div> Spinning...';
        
        // Select winner using weighted random selection
        const winner = this.selectWeightedWinner();
        
        // Calculate spin animation
        const baseSpins = 5; // Number of full rotations
        const randomSpin = Math.random() * 360; // Random final position
        const totalDegrees = (baseSpins * 360) + randomSpin;
        
        const wheel = document.getElementById('raffle-wheel');
        wheel.style.setProperty('--spin-degrees', `${totalDegrees}deg`);
        wheel.classList.add('wheel-spinning');
        
        // Show winner after spin completes
        setTimeout(() => {
            this.announceWinner(winner);
            this.raffleData.isSpinning = false;
        }, 4000);
        
        // Add suspense sound effect (visual feedback)
        this.addSpinEffects();
    }

    selectWeightedWinner() {
        const random = Math.random() * this.raffleData.totalEntries;
        let currentWeight = 0;
        
        for (const [name, data] of this.raffleData.participants) {
            currentWeight += data.entries;
            if (random <= currentWeight) {
                return { name, data };
            }
        }
        
        // Fallback (should never reach here)
        return this.raffleData.participants[0];
    }

    announceWinner(winner) {
        document.getElementById('winner-name').textContent = winner.name;
        document.getElementById('winner-details').textContent = 
            `Won with ${winner.data.entries} raffle entries!`;
        
        document.getElementById('spin-wheel-btn').style.display = 'none';
        document.getElementById('raffle-result').style.display = 'block';
        
        // Confetti effect
        this.createConfetti();
        
        // Success sound effect (visual feedback)
        this.showAlert(`🎉 ${winner.name} wins the raffle! 🎉`, 'success');
    }

    resetRaffle() {
        document.getElementById('raffle-result').style.display = 'none';
        document.getElementById('spin-wheel-btn').style.display = 'block';
        document.getElementById('spin-wheel-btn').disabled = false;
        document.getElementById('spin-wheel-btn').innerHTML = '<i class="fas fa-play"></i> Spin the Wheel!';
        
        const wheel = document.getElementById('raffle-wheel');
        wheel.classList.remove('wheel-spinning');
        wheel.style.transform = 'rotate(0deg)';
        
        if (this.raffleData) {
            this.setupRaffle(this.raffleData.participants);
        }
    }

    addSpinEffects() {
        // Add visual effects during spinning
        const wheel = document.getElementById('raffle-wheel');
        const center = wheel.querySelector('.wheel-center i');
        
        // Animate dice icon
        let iconRotation = 0;
        const iconAnimation = setInterval(() => {
            iconRotation += 45;
            center.style.transform = `rotate(${iconRotation}deg)`;
        }, 100);
        
        setTimeout(() => {
            clearInterval(iconAnimation);
            center.style.transform = 'rotate(0deg)';
        }, 4000);
    }

    createConfetti() {
        // Create confetti animation
        const colors = ['#c4d730', '#2d5016', '#4a7c59', '#ff6b6b', '#4ecdc4'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(confettiContainer);
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = Math.random() * 100;
                const animationDuration = (Math.random() * 3 + 2) + 's';
                const delay = Math.random() * 2 + 's';
                
                confetti.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: ${color};
                    left: ${left}%;
                    top: -10px;
                    border-radius: 50%;
                    animation: confettiFall ${animationDuration} ${delay} ease-out forwards;
                `;
                
                confettiContainer.appendChild(confetti);
            }, i * 50);
        }
        
        // Add confetti animation styles
        if (!document.querySelector('[data-confetti-style]')) {
            const style = document.createElement('style');
            style.setAttribute('data-confetti-style', '');
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Clean up after animation
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.remove();
            }
        }, 6000);
    }

    openExcelImportModal() {
        document.getElementById('excel-import-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.resetFileUpload();
    }

    closeExcelModal() {
        document.getElementById('excel-import-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetFileUpload();
    }

    resetFileUpload() {
        document.getElementById('excel-file').value = '';
        document.getElementById('file-info').style.display = 'none';
        document.getElementById('upload-area').classList.remove('dragover');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.displayFileInfo(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('upload-area').classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('upload-area').classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('upload-area').classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (this.isValidExcelFile(file)) {
                document.getElementById('excel-file').files = files;
                this.displayFileInfo(file);
            } else {
                this.showAlert('Please select a valid Excel file (.xlsx or .xls)', 'error');
            }
        }
    }

    isValidExcelFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];
        return validTypes.includes(file.type) || 
               file.name.toLowerCase().endsWith('.xlsx') || 
               file.name.toLowerCase().endsWith('.xls');
    }

    displayFileInfo(file) {
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        
        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        document.getElementById('file-info').style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadExcelFile() {
        const fileInput = document.getElementById('excel-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showAlert('Please select a file first', 'error');
            return;
        }

        if (!this.isValidExcelFile(file)) {
            this.showAlert('Please select a valid Excel file (.xlsx or .xls)', 'error');
            return;
        }

        const uploadBtn = document.getElementById('upload-btn');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<div class="loading"></div> Importing...';
        uploadBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/import_excel', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.error, 'error');
            } else {
                this.showAlert(data.message, 'success');
                await this.loadEmployees();
                this.closeExcelModal();
                
                // Show detailed import results
                if (data.file_info) {
                    console.log('Import Details:', data);
                }
            }
        } catch (error) {
            this.showAlert('Failed to upload file. Please try again.', 'error');
        } finally {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
        }
    }

    async addEmployee() {
        const nameInput = document.getElementById('employee-name');
        const name = nameInput.value.trim();

        if (!name) {
            this.showAlert('Please enter an employee name', 'error');
            return;
        }

        const btn = document.getElementById('add-employee-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loading"></div> Adding...';
        btn.disabled = true;

        try {
            const response = await fetch('/api/employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name })
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.error, 'error');
            } else {
                nameInput.value = '';
                this.showAlert(`Employee "${name}" added successfully!`, 'success');
                await this.loadEmployees();
            }
        } catch (error) {
            this.showAlert('Failed to add employee. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async loadEmployees() {
        try {
            const response = await fetch('/api/employees');
            this.employees = await response.json();
            this.renderEmployees();
            this.updateStats();
        } catch (error) {
            this.showAlert('Failed to load employees', 'error');
        }
    }

    renderEmployees() {
        const grid = document.getElementById('employees-grid');
        
        if (Object.keys(this.employees).length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Employees Yet</h3>
                    <p>Add your first employee to start tracking raffle entries!</p>
                </div>
            `;
            return;
        }

        const sortedEmployees = Object.entries(this.employees)
            .sort(([, a], [, b]) => b.entries - a.entries);

        grid.innerHTML = sortedEmployees.map(([name, data]) => `
            <div class="employee-card" data-employee="${name}">
                <div class="employee-header">
                    <div class="employee-name">${this.escapeHtml(name)}</div>
                    <div class="employee-entries">${data.entries} entries</div>
                </div>
                
                ${data.activities && data.activities.length > 0 ? `
                    <div class="activities-list">
                        ${data.activities.slice(-3).map(activity => `
                            <div class="activity-item">
                                <div class="activity-name">${this.escapeHtml(activity.activity)}</div>
                                <div class="activity-entries">+${activity.entries}</div>
                            </div>
                        `).join('')}
                        ${data.activities.length > 3 ? `<div class="activity-item"><em>+${data.activities.length - 3} more...</em></div>` : ''}
                    </div>
                ` : '<div class="activities-list"><em>No activities recorded yet</em></div>'}
                
                <div class="employee-actions">
                    <button class="btn btn-primary btn-small" onclick="dashboard.openAddEntryModal('${name}')">
                        <i class="fas fa-plus"></i> Add Entry
                    </button>
                    <button class="btn btn-warning btn-small" onclick="dashboard.resetEmployeePoints('${name}')">
                        <i class="fas fa-undo"></i> Reset to 0
                    </button>
                    <button class="btn btn-danger btn-small" onclick="dashboard.deleteEmployee('${name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    openAddEntryModal(employeeName) {
        this.currentEmployee = employeeName;
        document.getElementById('modal-employee-name').textContent = employeeName;
        document.getElementById('add-entry-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('add-entry-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentEmployee = null;
    }

    async addEntryToEmployee(employeeName, activity, entries) {
        try {
            const response = await fetch(`/api/employee/${encodeURIComponent(employeeName)}/add_entry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activity, entries })
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.error, 'error');
            } else {
                this.showAlert(`Added ${entries} entry(ies) for ${activity}`, 'success');
                await this.loadEmployees();
                this.closeModal();
            }
        } catch (error) {
            this.showAlert('Failed to add entry. Please try again.', 'error');
        }
    }

    async resetEmployeePoints(employeeName) {
        if (!confirm(`Are you sure you want to reset ${employeeName}'s raffle points to 0? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/employee/${encodeURIComponent(employeeName)}/reset_points`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.error, 'error');
            } else {
                this.showAlert(`${employeeName}'s raffle points have been reset to 0`, 'success');
                await this.loadEmployees();
            }
        } catch (error) {
            this.showAlert('Failed to reset points. Please try again.', 'error');
        }
    }

    async deleteEmployee(employeeName) {
        if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/employee/${encodeURIComponent(employeeName)}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.error, 'error');
            } else {
                this.showAlert(`Employee "${employeeName}" deleted successfully`, 'success');
                await this.loadEmployees();
            }
        } catch (error) {
            this.showAlert('Failed to delete employee. Please try again.', 'error');
        }
    }

    async resetData() {
        const confirmation = prompt('Type "RESET" to confirm you want to delete all data:');
        if (confirmation !== 'RESET') {
            return;
        }

        try {
            const response = await fetch('/api/reset', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.error) {
                this.showAlert(data.error, 'error');
            } else {
                this.showAlert('All data has been reset successfully', 'success');
                await this.loadEmployees();
            }
        } catch (error) {
            this.showAlert('Failed to reset data. Please try again.', 'error');
        }
    }

    updateStats() {
        const totalEmployees = Object.keys(this.employees).length;
        const totalEntries = Object.values(this.employees).reduce((sum, emp) => sum + emp.entries, 0);

        document.getElementById('total-employees').textContent = totalEmployees;
        document.getElementById('total-entries').textContent = totalEntries;
    }

    updateDateInfo() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('en-US', options);
        document.getElementById('current-date').textContent = formattedDate;
    }

    showAlert(message, type = 'success') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        const container = document.querySelector('.main-content');
        container.insertBefore(alert, container.firstChild);

        // Auto-remove alert after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideUp 0.3s ease-in-out';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Add slide up animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        to {
            transform: translateY(-20px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new RaffleDashboard();
});

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add subtle floating animation to logo
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        setInterval(() => {
            logoImg.style.transform += ` translateY(${Math.sin(Date.now() * 0.001) * 1}px)`;
        }, 100);
    }

    // Add subtle parallax effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            const scrolled = window.pageYOffset;
            header.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });

    // Add ripple effect to buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
            const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.height, rect.width);
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            ripple.classList.add('ripple');
            
            const rippleStyle = document.createElement('style');
            rippleStyle.textContent = `
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            if (!document.querySelector('[data-ripple-style]')) {
                rippleStyle.setAttribute('data-ripple-style', '');
                document.head.appendChild(rippleStyle);
            }
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
});