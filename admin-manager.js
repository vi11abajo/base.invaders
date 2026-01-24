//Admin Manager - Tournament Administration System
//Tournament management for administrators

class AdminManager {
    constructor() {
        this.admins = [
            'vi11abajo', //first administrator
            //Add other administrators by username
        ];
        this.isAdmin = false;
        this.currentUser = null;
    }

    /**
     * Initialization after user load
     */
    init(user) {
        this.currentUser = user;
        this.isAdmin = this.checkIsAdmin(user);

        if (this.isAdmin) {
            this.showAdminUI();
        }

        return this.isAdmin;
    }

    /**
     * Check if user is an administrator
     */
    checkIsAdmin(user) {
        if (!user) return false;

        //Check by username
        if (this.admins.includes(user.username)) {
            return true;
        }

        //Check by server role (if available)
        if (user.role === 'admin' || user.isAdmin === true) {
            return true;
        }

        return false;
    }

    /**
     * Show admin panel (for tournaments)
     */
    showAdminUI() {
        //Check if we are on tournament page
        if (window.location.pathname.includes('tournament')) {
            this.showTournamentAdminPanel();
        }
    }

    /**
     * Attach handlers to existing admin panel
     */
    attachEventHandlersToExistingPanel() {
        const startBtn = document.getElementById('adminStartTournament');
        const endBtn = document.getElementById('adminEndTournament');
        const refreshBtn = document.getElementById('adminRefreshData');

        if (startBtn) {
            startBtn.onclick = () => this.startTournament();
        }
        if (endBtn) {
            endBtn.onclick = () => this.endTournament();
        }
        if (refreshBtn) {
            refreshBtn.onclick = () => this.refreshData();
        }

    }

    /**
     * Show admin panel for tournaments
     */
    showTournamentAdminPanel() {
        //Find existing panel in HTML
        const existingPanel = document.getElementById('adminPanel');
        if (existingPanel) {

            //Show parent admin-footer container
            const adminFooter = existingPanel.closest('.admin-footer');
            if (adminFooter) {
                adminFooter.style.display = 'block';
            }

            //Show the panel itself
            existingPanel.style.display = 'block';

            //Attach handlers to buttons in existing panel
            this.attachEventHandlersToExistingPanel();

            return;
        }

        const adminPanel = document.createElement('div');
        adminPanel.id = 'adminPanel';
        adminPanel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%);
            border: 2px solid #FFD700;
            border-radius: 15px;
            padding: 20px;
            z-index: 9998;
            min-width: 250px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        `;

        adminPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="color: #FFD700; margin: 0; font-size: 18px;"> Admin Panel</h3>
                <p style="color: #FFD700; margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Tournament Management</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="adminStartTournament" class="admin-button" style="
                    background: linear-gradient(135deg, #00C851 0%, #007E33 100%);
                    color: white;
                    border: 2px solid #00C851;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    font-size: 14px;
                ">
                     Start Tournament
                </button>

                <button id="adminEndTournament" class="admin-button" style="
                    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
                    color: white;
                    border: 2px solid #ff4444;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    font-size: 14px;
                ">
                     End Tournament
                </button>

                <button id="adminRefreshData" class="admin-button" style="
                    background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
                    color: white;
                    border: 2px solid #2196F3;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    font-size: 14px;
                ">
                     Refresh Data
                </button>
            </div>

            <style>
                .admin-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }

                .admin-button:active {
                    transform: translateY(0);
                }

                .admin-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
        `;

        document.body.appendChild(adminPanel);

        //Add event handlers
        document.getElementById('adminStartTournament').addEventListener('click', () => this.startTournament());
        document.getElementById('adminEndTournament').addEventListener('click', () => this.endTournament());
        document.getElementById('adminRefreshData').addEventListener('click', () => this.refreshData());
    }

    /**
     * Start new tournament
     */
    async startTournament() {
        const name = prompt('Enter tournament name:', 'Weekly Tournament');
        if (!name) return;

        const durationMinutes = parseInt(prompt('Enter duration in minutes:', '20'));
        if (!durationMinutes || durationMinutes <= 0) return;

        try {
            const button = document.getElementById('adminStartTournament');
            if (button) button.disabled = true;

            const response = await apiClient.post('/api/tournaments/create', {
                name: name,
                duration: durationMinutes * 60 //in seconds
            });

            alert(` Tournament created!\nID: ${response.tournament.id}\nName: ${name}`);

            //Updating data
            if (window.tournamentLobby && window.tournamentLobby.loadActiveTournament) {
                await window.tournamentLobby.loadActiveTournament();
            }

        } catch (error) {
            console.error('Failed to start tournament:', error);
            alert(` Failed to start tournament: ${error.message}`);
        } finally {
            const button = document.getElementById('adminStartTournament');
            if (button) button.disabled = false;
        }
    }

    /**
     * End active tournament
     */
    async endTournament() {
        if (!confirm('Are you sure you want to end the active tournament?')) {
            return;
        }

        try {
            const button = document.getElementById('adminEndTournament');
            if (button) button.disabled = true;

            await apiClient.post('/api/tournaments/end-active');

            alert(' Tournament ended successfully!');

            //Updating data
            if (window.tournamentLobby && window.tournamentLobby.loadActiveTournament) {
                await window.tournamentLobby.loadActiveTournament();
            }

        } catch (error) {
            console.error('Failed to end tournament:', error);
            alert(` Failed to end tournament: ${error.message}`);
        } finally {
            const button = document.getElementById('adminEndTournament');
            if (button) button.disabled = false;
        }
    }

    /**
     * Update tournament data
     */
    async refreshData() {
        try {
            const button = document.getElementById('adminRefreshData');
            if (button) {
                button.disabled = true;
                button.textContent = ' Refreshing...';
            }

            if (window.tournamentLobby) {
                if (window.tournamentLobby.loadActiveTournament) {
                    await window.tournamentLobby.loadActiveTournament();
                }
                if (window.tournamentLobby.updateLeaderboard) {
                    await window.tournamentLobby.updateLeaderboard();
                }
            }

            alert(' Data refreshed!');

        } catch (error) {
            console.error('Failed to refresh data:', error);
            alert(` Failed to refresh: ${error.message}`);
        } finally {
            const button = document.getElementById('adminRefreshData');
            if (button) {
                button.disabled = false;
                button.textContent = ' Refresh Data';
            }
        }
    }

    /**
     * Hide admin panel
     */
    hideAdminUI() {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.remove();
        }
    }

    /**
     * Get list of administrators
     */
    getAdmins() {
        return [...this.admins];
    }

    /**
     * Add administrator (only for current session)
     */
    addAdmin(username) {
        if (!this.admins.includes(username)) {
            this.admins.push(username);
        }
    }
}

//Create global instance
window.adminManager = new AdminManager();

//Automatic initialization on user login
if (window.authManager) {
    authManager.addListener((event, data) => {
        if (event === 'login' && data) {
            adminManager.init(data);
        } else if (event === 'logout') {
            adminManager.hideAdminUI();
        }
    });
}

