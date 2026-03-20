/**
 * Statbotics API client for EPA (Expected Points Added) data
 * API docs: https://www.statbotics.io/docs/rest
 * Uses team_events bulk endpoint when possible (1 call for entire event)
 */
const Statbotics = {
    BASE: 'https://api.statbotics.io/v3',
    TEAM_EVENTS_CACHE_TTL_MS: 10 * 60 * 1000,

    fetchWithTimeout(url, ms = 15000) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal })
            .finally(() => clearTimeout(t));
    },
    async getTeam(teamKey) {
        const teamNum = (teamKey || '').replace(/^frc/i, '');
        if (!teamNum) return null;
        try {
            const res = await this.fetchWithTimeout(`${this.BASE}/team/${teamNum}`);
            if (!res.ok) return null;
            const ct = res.headers.get('content-type');
            if (!ct?.includes('application/json')) return null;
            const data = await res.json();
            return data && typeof data === 'object' && !data.error ? data : null;
        } catch {
            return null;
        }
    },
    async getTeamEvent(teamKey, eventKey, maxRetries = 5) {
        const teamNum = (teamKey || '').replace(/^frc/i, '');
        if (!teamNum || !eventKey) return null;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const res = await this.fetchWithTimeout(`${this.BASE}/team_event/${teamNum}/${eventKey}`, 12000);
                if (!res.ok) {
                    if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 300 + attempt * 200));
                    continue;
                }
                const ct = res.headers.get('content-type');
                if (!ct?.includes('application/json')) {
                    if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 300 + attempt * 200));
                    continue;
                }
                const data = await res.json();
                if (data && typeof data === 'object' && !data.error) return data;
            } catch {
                if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 300 + attempt * 200));
            }
        }
        return null;
    },
    async getEPAs(teamKeys, eventKey) {
        const results = await Promise.all(
            teamKeys.map(async (tk) => {
                const data = await this.getTeamEvent(tk, eventKey);
                const epa = data?.epa;
                const value = epa?.total_points?.mean ?? epa?.norm ?? epa?.unitless ?? epa?.unit_epa;
                const breakdown = epa?.breakdown;
                const round = (n) => typeof n === 'number' ? Math.round(n * 10) / 10 : null;
                return {
                    key: tk,
                    epa: typeof value === 'number' ? round(value) : null,
                    breakdown: breakdown ? {
                        auto: round(breakdown.auto_points),
                        teleop: round(breakdown.teleop_points),
                        endgame: round(breakdown.endgame_points)
                    } : null
                };
            })
        );
        return Object.fromEntries(results.map(r => [r.key, r]));
    },

    async getTeamEventsBulk(eventKey) {
        const cacheKey = `bms_sb_team_events_${eventKey}`;
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, ts } = JSON.parse(cached);
                if (data && ts && Date.now() - ts < this.TEAM_EVENTS_CACHE_TTL_MS) return data;
            }
        } catch (_) {}
        try {
            const res = await this.fetchWithTimeout(`${this.BASE}/team_events?event=${encodeURIComponent(eventKey)}&limit=100`, 15000);
            if (!res.ok) return null;
            const ct = res.headers.get('content-type');
            if (!ct?.includes('application/json')) return null;
            const arr = await res.json();
            if (!Array.isArray(arr)) return null;
            const round = (n) => typeof n === 'number' ? Math.round(n * 10) / 10 : null;
            const data = {};
            for (const d of arr) {
                const key = 'frc' + (d.team || '');
                const epa = d.epa;
                const value = epa?.total_points?.mean ?? epa?.norm ?? epa?.unitless ?? epa?.unit_epa;
                const breakdown = epa?.breakdown;
                const rec = d.record?.total ?? d.record?.qual ?? d.record;
                data[key] = {
                    key,
                    epa: typeof value === 'number' ? round(value) : null,
                    breakdown: breakdown ? {
                        auto: round(breakdown.auto_points),
                        teleop: round(breakdown.teleop_points),
                        endgame: round(breakdown.endgame_points)
                    } : null,
                    record: rec?.wins != null && rec?.losses != null ? `${rec.wins}-${rec.losses}` : null
                };
            }
            try {
                localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
            } catch (_) {}
            return data;
        } catch {
            return null;
        }
    },

    async getEPAsBatched(teamKeys, eventKey, batchSize = 8) {
        const bulk = await this.getTeamEventsBulk(eventKey);
        if (bulk) {
            return Object.fromEntries(teamKeys.map(tk => {
                const d = bulk[tk];
                if (d) return [tk, d];
                return [tk, { key: tk, epa: null, breakdown: null, record: null }];
            }));
        }
        const delay = (ms) => new Promise(r => setTimeout(r, ms));
        const results = [];
        for (let i = 0; i < teamKeys.length; i += batchSize) {
            const chunk = teamKeys.slice(i, i + batchSize);
            const chunkResults = await Promise.all(chunk.map(async (tk) => {
                const data = await this.getTeamEvent(tk, eventKey);
                const epa = data?.epa;
                const value = epa?.total_points?.mean ?? epa?.norm ?? epa?.unitless ?? epa?.unit_epa;
                const breakdown = epa?.breakdown;
                const rec = data?.record?.total ?? data?.record?.qual ?? data?.record;
                const round = (n) => typeof n === 'number' ? Math.round(n * 10) / 10 : null;
                return {
                    key: tk,
                    epa: typeof value === 'number' ? round(value) : null,
                    breakdown: breakdown ? {
                        auto: round(breakdown.auto_points),
                        teleop: round(breakdown.teleop_points),
                        endgame: round(breakdown.endgame_points)
                    } : null,
                    record: rec?.wins != null && rec?.losses != null ? `${rec.wins}-${rec.losses}` : null
                };
            }));
            results.push(...chunkResults);
            if (i + batchSize < teamKeys.length) await delay(150);
        }
        return Object.fromEntries(results.map(r => [r.key, r]));
    },

    async getMatch(matchKey) {
        try {
            const res = await this.fetchWithTimeout(`${this.BASE}/match/${matchKey}`);
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },

    async getTeamYear(teamKey, year, maxRetries = 5) {
        const teamNum = (teamKey || '').replace(/^frc/i, '');
        if (!teamNum) return null;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const res = await this.fetchWithTimeout(`${this.BASE}/team_year/${teamNum}/${year}`, 12000);
                if (!res.ok) {
                    if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 300 + attempt * 200));
                    continue;
                }
                const ct = res.headers.get('content-type');
                if (!ct?.includes('application/json')) {
                    if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 300 + attempt * 200));
                    continue;
                }
                const data = await res.json();
                if (data && typeof data === 'object' && !data.error) return data;
            } catch {
                if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, 300 + attempt * 200));
            }
        }
        return null;
    },

    async getTeamYearsBatched(teamKeys, year, fallbackYear = null) {
        const fetchOne = async (tk) => {
            let data = await this.getTeamYear(tk, year);
            if (!data && fallbackYear) {
                await new Promise(r => setTimeout(r, 150));
                data = await this.getTeamYear(tk, fallbackYear);
            }
            return data;
        };
        if (teamKeys.length <= 8) {
            return Promise.all(teamKeys.map(fetchOne));
        }
        const delay = (ms) => new Promise(r => setTimeout(r, ms));
        const results = [];
        for (let i = 0; i < teamKeys.length; i++) {
            results.push(await fetchOne(teamKeys[i]));
            if (i < teamKeys.length - 1) await delay(100);
        }
        return results;
    },

    async getTeamsBatched(teamKeys) {
        const delay = (ms) => new Promise(r => setTimeout(r, ms));
        const results = [];
        for (let i = 0; i < teamKeys.length; i++) {
            results.push(await this.getTeam(teamKeys[i]));
            if (i < teamKeys.length - 1) await delay(200);
        }
        return results;
    }
};

/**
 * Breaker Match Scouter — Main app logic
 */
const App = {
    currentEvent: null,
    currentMatchKey: null,

    init() {
        this.bindNavigation();
        this.route();
        window.addEventListener('hashchange', () => this.route());
    },

    bindNavigation() {
        document.getElementById('event-back').onclick = () => this.navigate('');
        document.getElementById('match-back').onclick = () => this.navigate('#event/' + (this.currentEvent || ''));
    },

    navigate(hash) {
        window.location.hash = hash || '';
    },

    route() {
        const hash = (window.location.hash || '#').slice(1);
        const [view, param] = hash.split('/');

        this.hideAllViews();

        if (view === 'event' && param) {
            this.showEvent(param);
        } else if (view === 'match' && param) {
            this.showMatch(param);
        } else {
            this.showLanding();
        }
    },

    hideAllViews() {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    },

    async showLanding() {
        document.getElementById('view-landing').style.display = 'flex';
        document.getElementById('test-mode-banner').style.display = CONFIG.TEST_MODE ? 'block' : 'none';
        const loading = document.getElementById('events-loading');
        const error = document.getElementById('events-error');
        const list = document.getElementById('events-list');

        loading.style.display = 'block';
        error.style.display = 'none';
        list.style.display = 'none';

        try {
            let filtered;
            if (CONFIG.TEST_MODE && CONFIG.TEST_EVENTS?.length) {
                const events = await Promise.all(CONFIG.TEST_EVENTS.map(k => TBA.getEvent(k).catch(() => null)));
                filtered = events.filter(Boolean).sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
            } else {
                const events = await TBA.getTeamEvents(CONFIG.TEAM_KEY, CONFIG.YEAR);
                filtered = (events || [])
                    .filter(e => !e.division_keys || e.division_keys.length === 0)
                    .sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));
            }

            loading.style.display = 'none';
            if (filtered.length === 0) {
                error.textContent = 'No events found for team 5104 in 2026.';
                error.style.display = 'block';
            } else {
                const teamKey = (CONFIG.TEST_MODE && CONFIG.TEST_SCHEDULE_TEAM) ? CONFIG.TEST_SCHEDULE_TEAM : CONFIG.TEAM_KEY;
                const statuses = await Promise.all(filtered.map(e => TBA.getTeamStatus(teamKey, e.key).catch(() => null)));
                list.innerHTML = filtered.map((e, i) => {
                    const st = statuses[i];
                    const r = st?.qual?.ranking;
                    const rank = r?.rank;
                    const wins = (r?.record?.wins ?? 0) + (st?.playoff?.record?.wins ?? 0);
                    const losses = (r?.record?.losses ?? 0) + (st?.playoff?.record?.losses ?? 0);
                    const ties = (r?.record?.ties ?? 0) + (st?.playoff?.record?.ties ?? 0);
                    const recordStr = [wins, losses, ties].filter(n => n > 0).length
                        ? `${wins}-${losses}${ties ? `-${ties}` : ''}` : null;
                    const rankRecord = rank != null && recordStr ? `Rank ${rank} · ${recordStr}` : recordStr || (rank != null ? `Rank ${rank}` : null);
                    return `
                    <a href="#event/${e.key}" class="event-link">
                        <h2>${this.escapeHtml(e.name || e.key)}</h2>
                        <div class="meta">${e.key} · ${e.start_date || ''} – ${e.end_date || ''}</div>
                        ${rankRecord ? `<div class="event-record">${rankRecord}</div>` : ''}
                    </a>
                `}).join('');
                list.style.display = 'flex';
            }
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Failed to load events: ' + err.message;
            error.style.display = 'block';
        }
    },

    async showEvent(eventKey) {
        this.currentEvent = eventKey;
        document.getElementById('view-event').style.display = 'flex';
        document.getElementById('event-title').textContent = 'Loading…';
        document.getElementById('event-schedule-links').style.display = 'none';
        document.getElementById('event-teams-ranking').style.display = 'none';

        const loading = document.getElementById('matches-loading');
        const error = document.getElementById('matches-error');
        const list = document.getElementById('matches-list');

        loading.style.display = 'block';
        error.style.display = 'none';
        list.style.display = 'none';

        try {
            const scheduleTeam = (CONFIG.TEST_MODE && CONFIG.TEST_SCHEDULE_TEAM) ? CONFIG.TEST_SCHEDULE_TEAM : CONFIG.TEAM_KEY;
            const [event, matches] = await Promise.all([
                TBA.getEvent(eventKey),
                TBA.getTeamMatches(scheduleTeam, eventKey)
            ]);

            document.getElementById('event-title').textContent = event.name || eventKey;

            const tbaEventUrl = `https://www.thebluealliance.com/event/${eventKey}`;
            const statboticsEventUrl = `https://www.statbotics.io/event/${eventKey}#insights`;
            const footerLinksHtml = `<a href="${tbaEventUrl}" target="_blank" rel="noopener">The Blue Alliance</a> · <a href="${statboticsEventUrl}" target="_blank" rel="noopener">Statbotics</a>`;
            document.getElementById('event-schedule-links').innerHTML = footerLinksHtml;
            document.getElementById('event-schedule-links').style.display = 'block';

            if (!matches || matches.length === 0) {
                loading.style.display = 'none';
                const tbaUrl = `https://www.thebluealliance.com/event/${eventKey}`;
                error.innerHTML = `<div class="alert-dialog"><p>No matches found${CONFIG.TEST_MODE ? ' for test schedule' : ' for team 5104'} at this event.</p><p>Check back once the schedule is posted on <a href="${this.escapeHtml(tbaUrl)}" target="_blank" rel="noopener">TBA</a>.</p></div>`;
                error.style.display = 'block';
                const teamsRankingEl = document.getElementById('event-teams-ranking');
                teamsRankingEl.innerHTML = '<div class="loading"><div class="spinner" aria-hidden="true"></div></div>';
                teamsRankingEl.style.display = 'block';
                try {
                    const teamsTable = await this.buildEventTeamsTable(eventKey);
                    teamsRankingEl.innerHTML = teamsTable || '';
                    if (!teamsTable) teamsRankingEl.style.display = 'none';
                } catch {
                    teamsRankingEl.innerHTML = '';
                    teamsRankingEl.style.display = 'none';
                }
            } else {
                const sorted = this.sortMatches(matches);
                const unplayed = sorted.filter(m => m.post_result_time == null);
                const winProbs = await this.fetchWinProbabilities(unplayed, scheduleTeam);
                list.innerHTML = this.renderMatchesTable(sorted, scheduleTeam, winProbs);
                list.style.display = 'block';
                loading.style.display = 'none';
            }
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Failed to load matches: ' + err.message;
            error.style.display = 'block';
        }
    },

    sortMatches(matches) {
        const order = { qm: 0, sf: 1, f: 2 };
        return [...matches].sort((a, b) => {
            const compA = (a.comp_level || 'qm').toLowerCase();
            const compB = (b.comp_level || 'qm').toLowerCase();
            if (order[compA] !== order[compB]) return (order[compA] || 99) - (order[compB] || 99);
            return (a.match_number || 0) - (b.match_number || 0);
        });
    },

    getMatchLabel(m) {
        const comp = (m.comp_level || 'qm').toLowerCase();
        if (comp === 'qm') return `Quals ${m.match_number || m.key?.split('_').pop() || ''}`;
        if (comp === 'f') return `Finals ${m.match_number || ''}`;
        const key = m.key || '';
        const match = key.match(/sf(\d+)m/);
        const num = match ? match[1] : (m.set_number || m.match_number || '');
        return `Match ${num}`;
    },

    getPlayoffRound(m) {
        const comp = (m.comp_level || 'qm').toLowerCase();
        if (comp === 'f') return 'Finals';
        if (comp !== 'sf') return null;
        const key = m.key || '';
        const match = key.match(/sf(\d+)m/);
        const setNum = match ? parseInt(match[1], 10) : (m.set_number || 1);
        if (setNum <= 4) return 'Round 1';
        if (setNum <= 8) return 'Round 2';
        if (setNum <= 10) return 'Round 3';
        if (setNum <= 12) return 'Round 4';
        return 'Round 5';
    },

    groupMatchesBySection(matches) {
        const sections = [];
        const quals = matches.filter(m => (m.comp_level || 'qm').toLowerCase() === 'qm');
        const playoffs = matches.filter(m => (m.comp_level || 'qm').toLowerCase() !== 'qm');
        if (quals.length) sections.push({ title: 'Qualification Results', matches: quals });
        if (playoffs.length) {
            const byRound = {};
            playoffs.forEach(m => {
                const round = this.getPlayoffRound(m);
                if (!byRound[round]) byRound[round] = [];
                byRound[round].push(m);
            });
            const roundOrder = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Finals'];
            roundOrder.forEach(round => {
                if (byRound[round]?.length) {
                    sections.push({ title: round, parent: 'Playoff Results', matches: byRound[round] });
                }
            });
        }
        return sections;
    },

    getMatchOutcome(m, scheduleTeam) {
        const red = m.alliances?.red || {};
        const blue = m.alliances?.blue || {};
        const redScore = red.score;
        const blueScore = blue.score;
        if (redScore == null || blueScore == null || redScore === blueScore) return '?';
        const inRed = (red.team_keys || []).includes(scheduleTeam);
        const inBlue = (blue.team_keys || []).includes(scheduleTeam);
        if (!inRed && !inBlue) return '?';
        const weWon = (inRed && redScore > blueScore) || (inBlue && blueScore > redScore);
        return weWon ? 'W' : 'L';
    },

    async buildEventTeamsTable(eventKey) {
        const teams = await TBA.getEventTeams(eventKey);
        if (!teams || teams.length === 0) return '';

        const CACHE_KEY = `bms_teams_${eventKey}`;
        const CACHE_VERSION = 6;
        const CACHE_TTL_MS = 60 * 60 * 1000;
        let epaData, yearData2026, yearData2025;

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, ts, v } = JSON.parse(cached);
                if (data && ts && v === CACHE_VERSION && Date.now() - ts < CACHE_TTL_MS) {
                    epaData = data.epaData;
                    yearData2026 = data.yearData2026;
                    yearData2025 = data.yearData2025;
                }
            }
        } catch (_) {}

        if (!epaData) {
            const teamKeys = teams.map(t => t.key);
            const delay = (ms) => new Promise(r => setTimeout(r, ms));
            const batch = async (items, fn, size = 8) => {
                const results = [];
                for (let i = 0; i < items.length; i += size) {
                    const chunk = items.slice(i, i + size);
                    results.push(...await Promise.all(chunk.map(fn)));
                    if (i + size < items.length) await delay(150);
                }
                return results;
            };
            [epaData, yearData2026, yearData2025] = await Promise.all([
                Statbotics.getEPAsBatched(teamKeys, eventKey),
                batch(teamKeys, tk => Statbotics.getTeamYear(tk, CONFIG.YEAR)),
                batch(teamKeys, tk => Statbotics.getTeamYear(tk, CONFIG.YEAR - 1))
            ]);
            for (let pass = 0; pass < 3; pass++) {
                const missing2025 = teamKeys.map((tk, i) => (!yearData2025[i] ? tk : null)).filter(Boolean);
                const missing2026 = teamKeys.map((tk, i) => (!yearData2026[i] ? tk : null)).filter(Boolean);
                if (missing2025.length === 0 && missing2026.length === 0) break;
                const fill = async (keys, year) => {
                    for (let j = 0; j < keys.length; j += 4) {
                        const chunk = keys.slice(j, j + 4);
                        const results = await Promise.all(chunk.map(tk => Statbotics.getTeamYear(tk, year)));
                        chunk.forEach((tk, k) => {
                            const i = teamKeys.indexOf(tk);
                            if (i !== -1 && results[k]) (year === CONFIG.YEAR ? yearData2026 : yearData2025)[i] = results[k];
                        });
                        if (j + 4 < keys.length) await delay(200);
                    }
                };
                await Promise.all([fill(missing2025, CONFIG.YEAR - 1), fill(missing2026, CONFIG.YEAR)]);
            }
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: { epaData, yearData2026, yearData2025 },
                    ts: Date.now(),
                    v: CACHE_VERSION
                }));
            } catch (_) {}
        }

        const round = (n) => typeof n === 'number' ? Math.round(n * 10) / 10 : null;
        const extractEpa = (ty, eventData) => {
            const epaEvent = eventData?.epa ?? null;
            let epaYear = null;
            if (ty?.epa) {
                const e = ty.epa;
                epaYear = round(e.total_points?.mean) ?? round(e.norm) ?? round(e.unitless) ?? round(e.unit_epa);
            } else if (ty?.norm_epa) {
                const n = ty.norm_epa;
                epaYear = round(typeof n === 'number' ? n : (n?.current ?? n?.mean));
            }
            return epaEvent ?? epaYear ?? null;
        };
        const extractRecord = (ty) => {
            const r = ty?.record?.total ?? ty?.record?.qual ?? ty?.record ?? ty?.qual_record;
            const wins = r?.wins ?? ty?.record?.wins ?? null;
            const losses = r?.losses ?? ty?.record?.losses ?? null;
            return wins != null && losses != null ? `${wins}-${losses}` : '–';
        };

        const rows = teams.map((t, i) => {
            const tk = t.key;
            const eventData = epaData[tk];
            const ty2026 = yearData2026[i];
            const ty2025 = yearData2025[i];
            const epa2026 = extractEpa(ty2026, eventData);
            const epa2025 = extractEpa(ty2025, null);
            const record2026 = extractRecord(ty2026);
            const record2025 = extractRecord(ty2025);
            const location = t.city || '–';
            return {
                teamNum: t.team_number,
                name: this.shortenTeamName(t.nickname || t.name || 'N/A'),
                location,
                epa2026,
                record2026,
                epa2025,
                record2025,
                isUs: tk === CONFIG.TEAM_KEY,
                statboticsUrl: `https://www.statbotics.io/team/${t.team_number}`
            };
        });

        rows.sort((a, b) => (b.epa2026 ?? -1) - (a.epa2026 ?? -1));

        const thead = `
            <thead>
                <tr>
                    <th>Team</th>
                    <th>Team Name</th>
                    <th>Location</th>
                    <th class="epa-col">EPA '26</th>
                    <th>Record '26</th>
                    <th class="epa-col">EPA '25</th>
                    <th>Record '25</th>
                </tr>
            </thead>`;
        const tbody = rows.map(r => `
            <tr>
                <td>${r.teamNum}</td>
                <td><a href="${r.statboticsUrl}" target="_blank" rel="noopener" class="team-name-link">${r.isUs ? '⭐ ' : ''}${this.escapeHtml(r.name)}</a></td>
                <td>${this.escapeHtml(r.location)}</td>
                <td class="epa-col">${r.epa2026 != null ? r.epa2026.toFixed(1) : '–'}</td>
                <td>${r.record2026}</td>
                <td class="epa-col">${r.epa2025 != null ? r.epa2025.toFixed(1) : '–'}</td>
                <td>${r.record2025}</td>
            </tr>
        `).join('');

        return `
            <section class="match-section">
                <h2 class="match-section-title">Teams by EPA</h2>
                <div class="match-table-wrap">
                    <table class="match-table teams-table">
                        ${thead}
                        <tbody>${tbody}</tbody>
                    </table>
                </div>
            </section>`;
    },

    async fetchWinProbabilities(matches, scheduleTeam) {
        const delay = (ms) => new Promise(r => setTimeout(r, ms));
        const results = [];
        for (let i = 0; i < matches.length; i += 6) {
            const chunk = matches.slice(i, i + 6);
            const chunkResults = await Promise.all(chunk.map(async (m) => {
                const data = await Statbotics.getMatch(m.key);
                const pred = data?.pred;
                if (pred?.red_win_prob == null) return { key: m.key, winProb: null };
                const inRed = (m.alliances?.red?.team_keys || []).includes(scheduleTeam);
                const inBlue = (m.alliances?.blue?.team_keys || []).includes(scheduleTeam);
                const ourProb = inRed ? pred.red_win_prob : inBlue ? (1 - pred.red_win_prob) : null;
                return { key: m.key, winProb: ourProb };
            }));
            results.push(...chunkResults);
            if (i + 6 < matches.length) await delay(150);
        }
        return Object.fromEntries(results.map(r => [r.key, r.winProb]));
    },

    renderMatchesTable(matches, scheduleTeam, winProbs = {}) {
        const sections = this.groupMatchesBySection(matches);
        let html = '';
        let inPlayoffs = false;
        sections.forEach(s => {
            if (s.parent === 'Playoff Results') {
                if (!inPlayoffs) {
                    html += '<section class="match-section match-section-playoff"><h2 class="match-section-title">Playoff Results</h2>';
                    inPlayoffs = true;
                }
                html += `<h3 class="match-subsection-title">${s.title}</h3>`;
            } else {
                if (inPlayoffs) html += '</section>';
                inPlayoffs = false;
                html += `<section class="match-section"><h2 class="match-section-title">${s.title}</h2>`;
            }
            const thead = `
                        <thead>
                            <tr>
                                <th>Match</th>
                                <th>Red Alliance</th>
                                <th>Blue Alliance</th>
                                <th class="scores">Scores</th>
                                <th>W/L</th>
                            </tr>
                        </thead>
            `;
            html += `
                <div class="match-table-wrap">
                    <table class="match-table">
                        ${thead}
                        <tbody>
                            ${s.matches.map(m => this.renderMatchRow(m, scheduleTeam, winProbs)).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });
        if (inPlayoffs) html += '</section>';
        else if (sections.length) html += '</section>';
        return html;
    },

    renderMatchRow(m, scheduleTeam, winProbs = {}) {
        const red = m.alliances?.red || {};
        const blue = m.alliances?.blue || {};
        const redTeams = (red.team_keys || []).map(t => t.replace('frc', ''));
        const blueTeams = (blue.team_keys || []).map(t => t.replace('frc', ''));
        const redScore = red.score ?? '–';
        const blueScore = blue.score ?? '–';
        const label = this.getMatchLabel(m);
        const outcome = this.getMatchOutcome(m, scheduleTeam);
        const isKnown = m.post_result_time != null;
        const winProb = winProbs[m.key];
        const wlDisplay = isKnown ? outcome : (winProb != null ? `${Math.round(winProb * 100)}%` : '?');
        const outcomeClass = isKnown ? (outcome === '?' ? 'unknown' : outcome.toLowerCase()) : 'unknown';
        const knownClass = isKnown ? 'outcome-known' : 'outcome-predicted';
        return `
            <tr>
                <td><a href="#match/${m.key}" class="match-link">${label}</a></td>
                <td class="alliance-red">${redTeams.map(n => `<span class="team-num">${n}</span>`).join(' ')}</td>
                <td class="alliance-blue">${blueTeams.map(n => `<span class="team-num">${n}</span>`).join(' ')}</td>
                <td class="scores"><span class="red-score">${redScore}</span> <span class="blue-score">${blueScore}</span></td>
                <td class="outcome outcome-${outcomeClass} ${knownClass}">${wlDisplay}</td>
            </tr>
        `;
    },

    async showMatch(matchKey) {
        this.currentMatchKey = matchKey;
        const [eventKey] = matchKey.split('_');
        this.currentEvent = eventKey;

        document.getElementById('view-match').style.display = 'flex';
        document.getElementById('match-title').textContent = matchKey.replace('_', ' ').toUpperCase();

        const loading = document.getElementById('report-loading');
        const error = document.getElementById('report-error');
        const content = document.getElementById('report-content');

        loading.style.display = 'block';
        error.style.display = 'none';
        content.style.display = 'none';

        try {
            const html = await this.buildReport(matchKey, eventKey);
            content.innerHTML = html;
            content.style.display = 'block';
            loading.style.display = 'none';
        } catch (err) {
            loading.style.display = 'none';
            error.textContent = 'Failed to load report: ' + err.message;
            error.style.display = 'block';
        }
    },

    async buildReport(matchKey, eventKey) {
        const match = await TBA.getMatch(matchKey);
        const hasOccurred = match.post_result_time != null || match.score_breakdown != null;

        if (hasOccurred) {
            const CACHE_KEY = `bms_match_${matchKey}`;
            const CACHE_TTL_MS = 60 * 60 * 1000;
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { html, ts } = JSON.parse(cached);
                    if (html && ts && Date.now() - ts < CACHE_TTL_MS) return html;
                }
            } catch (_) {}
        }

        const redTeams = (match.alliances?.red?.team_keys || []);
        const blueTeams = (match.alliances?.blue?.team_keys || []);
        const teamKeys = [...redTeams, ...blueTeams];

        const [oprsData, teamsAndStatus, epas, yearData] = await Promise.all([
            TBA.getEventOPRs(eventKey),
            this.fetchTeamsAndStatus(match, eventKey),
            Statbotics.getEPAsBatched(teamKeys, eventKey, 6),
            Statbotics.getTeamYearsBatched(teamKeys, CONFIG.YEAR, CONFIG.YEAR - 1)
        ]);
        const oprs = oprsData?.oprs || {};

        const round = (n) => typeof n === 'number' ? Math.round(n * 10) / 10 : null;
        const extractEpa = (ty) => {
            if (!ty) return null;
            const e = ty.epa;
            const fromEpa = e ? (round(e.total_points?.mean) ?? round(e.norm) ?? round(e.unitless) ?? round(e.unit_epa)) : null;
            if (fromEpa != null) return fromEpa;
            const n = ty.norm_epa;
            return n != null ? round(typeof n === 'number' ? n : (n?.current ?? n?.mean ?? n?.recent)) : null;
        };
        const extractBreakdown = (ty) => {
            const b = ty?.epa?.breakdown;
            if (!b) return null;
            const auto = round(b.auto_points) ?? round(b.auto);
            const teleop = round(b.teleop_points) ?? round(b.teleop);
            const endgame = round(b.endgame_points) ?? round(b.endgame);
            if (auto == null && teleop == null && endgame == null) return null;
            return { auto, teleop, endgame };
        };

        const getSeasonRecord = (ty) => {
            const r = ty?.record?.total ?? ty?.record?.qual ?? ty?.record;
            return { wins: r?.wins ?? 0, losses: r?.losses ?? 0 };
        };
        const teamData = teamKeys.map((tk, i) => {
            const t = teamsAndStatus[i];
            const ty = yearData[i];
            const season = getSeasonRecord(ty);
            const alliance = redTeams.includes(tk) ? 'red' : 'blue';
            const opr = oprs[tk];
            const epaData = epas?.[tk];
            const epa = epaData?.epa ?? extractEpa(ty);
            const epaBreakdown = epaData?.breakdown ?? extractBreakdown(ty);
            return {
                key: tk,
                teamNum: t.team?.team_number,
                name: this.shortenTeamName(t.team?.nickname || 'N/A'),
                location: t.team?.city || '',
                alliance,
                opr: opr != null ? Math.round(opr * 10) / 10 : 'N/A',
                epa: epa != null ? epa : 'N/A',
                epaBreakdown,
                eventWins: t.eventWins || 0,
                eventLosses: t.eventLosses || 0,
                rank: t.rank,
                seasonWins: season.wins,
                seasonLosses: season.losses
            };
        });

        let redOpr = 0, blueOpr = 0, redEpa = 0, blueEpa = 0;
        teamData.forEach(t => {
            if (typeof t.opr === 'number') {
                if (t.alliance === 'red') redOpr += t.opr;
                else blueOpr += t.opr;
            }
            if (typeof t.epa === 'number') {
                if (t.alliance === 'red') redEpa += t.epa;
                else blueEpa += t.epa;
            }
        });

        const hasOpr = redOpr > 0 || blueOpr > 0;
        const hasEpa = redEpa > 0 || blueEpa > 0;
        // Scale-invariant: treat each metric as a "Red win probability" (0–1), then average
        const redOprProb = hasOpr && (redOpr + blueOpr) > 0 ? redOpr / (redOpr + blueOpr) : 0.5;
        const redEpaProb = hasEpa && (redEpa + blueEpa) > 0 ? redEpa / (redEpa + blueEpa) : 0.5;
        const redProb = hasOpr && hasEpa ? (redOprProb + redEpaProb) / 2 : hasEpa ? redEpaProb : redOprProb;
        const predWinner = redProb >= 0.5 ? 'red' : 'blue';
        const confidence = Math.min(99, Math.round(Math.max(redProb, 1 - redProb) * 100));

        let resultHtml = '';
        if (match.score_breakdown) {
            const redScore = match.score_breakdown.red?.totalPoints ?? match.alliances?.red?.score;
            const blueScore = match.score_breakdown.blue?.totalPoints ?? match.alliances?.blue?.score;
            const actualWinner = redScore > blueScore ? 'red' : 'blue';
            resultHtml = `
                <div class="observed">
                    Result: <span class="winner ${actualWinner}">${actualWinner.toUpperCase()} won ${Math.max(redScore, blueScore)}–${Math.min(redScore, blueScore)}</span>
                </div>
            `;
        }

        const renderTeamBlock = (t) => {
            const teamNum = (t.key || '').replace('frc', '') || t.teamNum;
            const tbaTeamUrl = `https://www.thebluealliance.com/team/${teamNum}/${CONFIG.YEAR}`;
            const epa = typeof t.epa === 'number' ? t.epa : null;
            const epaEmoji = t.key === CONFIG.TEAM_KEY ? '' : (epa != null && epa >= 100 ? ' 🦄' : epa != null && epa >= 50 ? ' 💪' : '');
            const titleLine = t.location
                ? `${teamNum}${t.key === CONFIG.TEAM_KEY ? ' ⭐' : ''}${epaEmoji}: ${this.escapeHtml(t.name)} <span class="team-location">· ${this.escapeHtml(t.location)}</span>`
                : `${teamNum}${t.key === CONFIG.TEAM_KEY ? ' ⭐' : ''}${epaEmoji}: ${this.escapeHtml(t.name)}`;
            const rankLine = t.rank != null
                ? `Rank ${t.rank} (${t.eventWins}-${t.eventLosses} event, ${t.seasonWins}-${t.seasonLosses} season)`
                : `${t.eventWins}-${t.eventLosses} event, ${t.seasonWins}-${t.seasonLosses} season`;
            const oprEpaLine = `OPR: ${t.opr}, EPA: ${t.epa}`;
            const breakdown = t.epaBreakdown;
            const breakdownLine = breakdown && (breakdown.auto != null || breakdown.teleop != null || breakdown.endgame != null)
                ? `Auto: ${breakdown.auto ?? '–'}, Teleop: ${breakdown.teleop ?? '–'}, Endgame: ${breakdown.endgame ?? '–'}`
                : null;
            return `
                <div class="team-block ${t.alliance}">
                    <h3 class="team-block-title"><a href="${tbaTeamUrl}" target="_blank" rel="noopener" class="team-link">${titleLine}</a></h3>
                    <div class="stat-row">${rankLine}</div>
                    <div class="stat-row">${oprEpaLine}</div>
                    ${breakdownLine ? `<div class="stat-row stat-label">${breakdownLine}</div>` : ''}
                </div>
            `;
        };

        const redTeamData = teamData.filter(t => t.alliance === 'red');
        const blueTeamData = teamData.filter(t => t.alliance === 'blue');
        const redColumn = redTeamData.map(renderTeamBlock).join('');
        const blueColumn = blueTeamData.map(renderTeamBlock).join('');

        const tbaMatchUrl = `https://www.thebluealliance.com/match/${matchKey}`;
        const html = `
            <div class="report-section">
                <div class="alliances-grid">
                    <div class="alliance-column red">
                        <h3 class="alliance-heading">Red Alliance</h3>
                        ${redColumn}
                    </div>
                    <div class="alliance-column blue">
                        <h3 class="alliance-heading">Blue Alliance</h3>
                        ${blueColumn}
                    </div>
                </div>
            </div>
            <div class="prediction-block">
                <h2>Match Prediction</h2>
                <div class="stat-row">RED OPR: ${redOpr.toFixed(1)} vs BLUE OPR: ${blueOpr.toFixed(1)}</div>
                ${(redEpa > 0 || blueEpa > 0) ? `<div class="stat-row">RED EPA: ${redEpa.toFixed(1)} vs BLUE EPA: ${blueEpa.toFixed(1)}</div>` : ''}
                ${hasOpr && hasEpa ? '<div class="stat-row stat-label">Prediction uses combined OPR + EPA</div>' : ''}
                <div class="winner ${predWinner}">Prediction: ${predWinner.toUpperCase()} victory (${confidence}% confidence)</div>
                ${resultHtml}
            </div>
            <p class="tba-match-link"><a href="${tbaMatchUrl}" target="_blank" rel="noopener">The Blue Alliance</a> · <a href="https://www.statbotics.io/match/${matchKey}" target="_blank" rel="noopener">Statbotics</a></p>
        `;
        if (hasOccurred) {
            try {
                localStorage.setItem(`bms_match_${matchKey}`, JSON.stringify({ html, ts: Date.now() }));
            } catch (_) {}
        }
        return html;
    },

    async fetchTeamsAndStatus(match, eventKey) {
        const redTeams = (match.alliances?.red?.team_keys || []);
        const blueTeams = (match.alliances?.blue?.team_keys || []);
        const teamKeys = [...redTeams, ...blueTeams];

        const results = await Promise.all(teamKeys.map(async (tk) => {
            const [team, status] = await Promise.all([
                TBA.getTeam(tk),
                TBA.getTeamStatus(tk, eventKey)
            ]);
            let eventWins = 0, eventLosses = 0, rank = null;
            if (status?.qual?.ranking) {
                const r = status.qual.ranking;
                eventWins = (r.record?.wins || 0) + (status.playoff?.record?.wins || 0);
                eventLosses = (r.record?.losses || 0) + (status.playoff?.record?.losses || 0);
                rank = r.rank;
            }
            return { team, eventWins, eventLosses, rank };
        }));
        return results;
    },

    escapeHtml(s) {
        if (!s) return '';
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    },

    shortenTeamName(name) {
        if (!name || typeof name !== 'string') return name || 'N/A';
        let s = name;
        const idx = s.toLowerCase().indexOf('robotics');
        if (idx !== -1) s = s.slice(0, idx).trim();
        return s.replace(/\bHigh School\b/gi, 'HS');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
