const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'profiles.json');

class StorageService {
    constructor() {
        this.profiles = {};
        this.init();
    }

    init() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (fs.existsSync(DATA_FILE)) {
            try {
                const data = fs.readFileSync(DATA_FILE, 'utf8');
                this.profiles = JSON.parse(data);
            } catch (err) {
                console.error("Error reading profiles.json:", err);
                this.profiles = {};
            }
        } else {
            this.profiles = {}; // Start empty if no file
        }
    }

    _persist() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.profiles, null, 2));
        } catch (err) {
            console.error("Error writing profiles.json:", err);
        }
    }

    saveProfile(id, data) {
        this.profiles[id] = { ...this.profiles[id], ...data, lastUpdated: new Date() };
        this._persist();
        return this.profiles[id];
    }

    getProfile(id) {
        return this.profiles[id];
    }

    getAllProfiles() {
        return this.profiles;
    }
}

module.exports = new StorageService();
