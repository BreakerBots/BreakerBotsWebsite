/**
 * Statbotics API client for EPA (Expected Points Added) data
 * API docs: https://www.statbotics.io/docs/rest
 * Uses team_event endpoint for event-specific EPA (matches statbotics.io/event/...)
 */
const Statbotics = {
    BASE: 'https://api.statbotics.io/v3',
    async getTeamEvent(teamKey, eventKey) {
        const teamNum = (teamKey || '').replace(/^frc/i, '');
        if (!teamNum || !eventKey) return null;
        try {
            const res = await fetch(`${this.BASE}/team_event/${teamNum}/${eventKey}`, {
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },
    async getEPAs(teamKeys, eventKey) {
        const results = await Promise.all(
            teamKeys.map(async (tk) => {
                const data = await this.getTeamEvent(tk, eventKey);
                const epa = data?.epa;
                const value = epa?.total_points?.mean ?? epa?.norm ?? epa?.unitless;
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

    async getMatch(matchKey) {
        try {
            const res = await fetch(`${this.BASE}/match/${matchKey}`, {
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },

    async getTeamYear(teamKey, year) {
        const teamNum = (teamKey || '').replace(/^frc/i, '');
        if (!teamNum) return null;
        try {
            const res = await fetch(`${this.BASE}/team_year/${teamNum}/${year}`, {
                headers: { Accept: 'application/json' }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
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
        document.getElementById('event-links').style.display = 'none';
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
            const headerLinksHtml = `<a href="${tbaEventUrl}" target="_blank" rel="noopener" class="link-white">The Blue Alliance</a> · <a href="${statboticsEventUrl}" target="_blank" rel="noopener" class="link-white">Statbotics</a>`;
            const footerLinksHtml = `<a href="${tbaEventUrl}" target="_blank" rel="noopener">The Blue Alliance</a> · <a href="${statboticsEventUrl}" target="_blank" rel="noopener">Statbotics</a>`;
            document.getElementById('event-links').innerHTML = headerLinksHtml;
            document.getElementById('event-links').style.display = 'block';
            document.getElementById('event-schedule-links').innerHTML = footerLinksHtml;
            document.getElementById('event-schedule-links').style.display = 'block';

            if (!matches || matches.length === 0) {
                loading.style.display = 'none';
                const tbaUrl = `https://www.thebluealliance.com/event/${eventKey}`;
                error.innerHTML = `No matches found${CONFIG.TEST_MODE ? ' for test schedule' : ' for team 5104'} at this event. Check back once the schedule is posted on <a href="${this.escapeHtml(tbaUrl)}" target="_blank" rel="noopener" class="link-white">TBA</a>.`;
                error.style.display = 'block';
                const teamsRankingEl = document.getElementById('event-teams-ranking');
                teamsRankingEl.innerHTML = '<div class="loading">Loading teams…</div>';
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

        const teamKeys = teams.map(t => t.key);
        const epaData = await Statbotics.getEPAs(teamKeys, eventKey);
        const yearData = await Promise.all(teamKeys.map(tk => Statbotics.getTeamYear(tk, CONFIG.YEAR)));

        const rows = teams.map((t, i) => {
            const tk = t.key;
            const epa = epaData[tk]?.epa ?? null;
            const ty = yearData[i];
            const record = ty?.record?.total ?? ty?.record ?? ty?.qual_record;
            const wins = record?.wins ?? null;
            const losses = record?.losses ?? null;
            const recordStr = wins != null && losses != null ? `${wins}-${losses}` : '–';
            return {
                teamNum: t.team_number,
                name: t.nickname || 'N/A',
                city: t.city || '',
                epa: epa != null ? epa : null,
                record: recordStr,
                isUs: tk === CONFIG.TEAM_KEY
            };
        });

        rows.sort((a, b) => (b.epa ?? -1) - (a.epa ?? -1));

        const thead = `
            <thead>
                <tr>
                    <th>Team</th>
                    <th>Team Name</th>
                    <th>City</th>
                    <th class="epa-col">EPA</th>
                    <th>Record</th>
                </tr>
            </thead>`;
        const tbody = rows.map(r => `
            <tr>
                <td>${r.teamNum}${r.isUs ? ' ⭐' : ''}</td>
                <td>${this.escapeHtml(r.name)}</td>
                <td>${this.escapeHtml(r.city)}</td>
                <td class="epa-col">${r.epa != null ? r.epa.toFixed(1) : '–'}</td>
                <td>${r.record}</td>
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
        const results = await Promise.all(matches.map(async (m) => {
            const data = await Statbotics.getMatch(m.key);
            const pred = data?.pred;
            if (pred?.red_win_prob == null) return { key: m.key, winProb: null };
            const inRed = (m.alliances?.red?.team_keys || []).includes(scheduleTeam);
            const inBlue = (m.alliances?.blue?.team_keys || []).includes(scheduleTeam);
            const ourProb = inRed ? pred.red_win_prob : inBlue ? (1 - pred.red_win_prob) : null;
            return { key: m.key, winProb: ourProb };
        }));
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
                                <th>Win Prob</th>
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
        const outcomeClass = outcome === '?' ? 'unknown' : outcome.toLowerCase();
        const knownClass = isKnown ? 'outcome-known' : 'outcome-predicted';
        const winProb = winProbs[m.key];
        const winProbDisplay = !isKnown && winProb != null ? `${Math.round(winProb * 100)}%` : '–';
        return `
            <tr>
                <td><a href="#match/${m.key}" class="match-link">${label}</a></td>
                <td class="alliance-red">${redTeams.map(n => `<span class="team-num">${n}</span>`).join(' ')}</td>
                <td class="alliance-blue">${blueTeams.map(n => `<span class="team-num">${n}</span>`).join(' ')}</td>
                <td class="scores"><span class="red-score">${redScore}</span> <span class="blue-score">${blueScore}</span></td>
                <td class="outcome outcome-${outcomeClass} ${knownClass}">${outcome}</td>
                <td class="win-prob">${winProbDisplay}</td>
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
        const redTeams = (match.alliances?.red?.team_keys || []);
        const blueTeams = (match.alliances?.blue?.team_keys || []);
        const teamKeys = [...redTeams, ...blueTeams];

        const [oprsData, teamsAndStatus, epas] = await Promise.all([
            TBA.getEventOPRs(eventKey),
            this.fetchTeamsAndStatus(match, eventKey),
            Statbotics.getEPAs(teamKeys, eventKey)
        ]);
        const oprs = oprsData?.oprs || {};

        const teamData = teamKeys.map((tk, i) => {
            const t = teamsAndStatus[i];
            const alliance = redTeams.includes(tk) ? 'red' : 'blue';
            const opr = oprs[tk];
            const epaData = epas?.[tk];
            const epa = epaData?.epa;
            const epaBreakdown = epaData?.breakdown;
            return {
                key: tk,
                teamNum: t.team?.team_number,
                name: t.team?.nickname || 'N/A',
                location: t.team?.city || '',
                alliance,
                opr: opr != null ? Math.round(opr * 10) / 10 : 'N/A',
                epa: epa != null ? epa : 'N/A',
                epaBreakdown,
                eventWins: t.eventWins || 0,
                eventLosses: t.eventLosses || 0,
                rank: t.rank,
                seasonWins: t.seasonWins || 0,
                seasonLosses: t.seasonLosses || 0
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
            const titleLine = t.location
                ? `${teamNum}${t.key === CONFIG.TEAM_KEY ? ' ⭐' : ''}: ${this.escapeHtml(t.name)} <span class="team-location">· ${this.escapeHtml(t.location)}</span>`
                : `${teamNum}${t.key === CONFIG.TEAM_KEY ? ' ⭐' : ''}: ${this.escapeHtml(t.name)}`;
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
        return `
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
            let seasonWins = 0, seasonLosses = 0;
            try {
                const events = await TBA.getTeamEvents(tk, CONFIG.YEAR);
                for (const ev of events || []) {
                    if (ev.division_keys?.length) continue;
                    const st = await TBA.getTeamStatus(tk, ev.key);
                    if (st?.qual?.ranking) {
                        seasonWins += (st.qual.ranking.record?.wins || 0) + (st.playoff?.record?.wins || 0);
                        seasonLosses += (st.qual.ranking.record?.losses || 0) + (st.playoff?.record?.losses || 0);
                    }
                }
            } catch (_) {}
            return { team, eventWins, eventLosses, rank, seasonWins, seasonLosses };
        }));
        return results;
    },

    escapeHtml(s) {
        if (!s) return '';
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
