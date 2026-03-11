/**
 * TBA API client for browser
 */
const TBA = {
    async fetch(path) {
        const base = CONFIG.CORS_PROXY ? CONFIG.CORS_PROXY + encodeURIComponent(CONFIG.TBA_BASE + path) : CONFIG.TBA_BASE + path;
        const res = await fetch(base, {
            headers: { 'X-TBA-Auth-Key': CONFIG.TBA_API_KEY }
        });
        if (!res.ok) throw new Error(`TBA API: ${res.status} ${res.statusText}`);
        return res.json();
    },

    async getTeamEvents(teamKey, year) {
        return this.fetch(`/team/${teamKey}/events/${year}`);
    },

    async getEvent(eventKey) {
        return this.fetch(`/event/${eventKey}`);
    },

    async getEventMatches(eventKey) {
        return this.fetch(`/event/${eventKey}/matches`);
    },

    async getMatch(matchKey) {
        return this.fetch(`/match/${matchKey}`);
    },

    async getEventOPRs(eventKey) {
        try {
            return await this.fetch(`/event/${eventKey}/oprs`);
        } catch {
            return { oprs: {} };
        }
    },

    async getTeam(teamKey) {
        return this.fetch(`/team/${teamKey}`);
    },

    async getTeamStatus(teamKey, eventKey) {
        try {
            return await this.fetch(`/team/${teamKey}/event/${eventKey}/status`);
        } catch {
            return null;
        }
    },

    async getTeamMatches(teamKey, eventKey) {
        return this.fetch(`/team/${teamKey}/event/${eventKey}/matches`);
    }
};
