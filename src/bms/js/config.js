/**
 * Breaker Match Scouter — Configuration
 */
const CONFIG = (() => {
    const _ = 'TWRnVEFwZFN5Q3lsdzg0SWdXUTFFdjNscFRGZHdhUVVSeVJVQkdvTGJhaTVZMXVWT2t0eG1Sc1htRGhwVVlQWg==';
    return {
    TEAM_KEY: 'frc5104',
    YEAR: 2026,
    TBA_API_KEY: (typeof localStorage !== 'undefined' && localStorage.getItem('TBA_API_KEY')) || (typeof atob !== 'undefined' ? atob(_) : ''),
    TBA_BASE: 'https://www.thebluealliance.com/api/v3',
    // Optional CORS proxy if direct TBA requests fail (requires header forwarding for TBA auth)
    CORS_PROXY: '',
    // Test mode: use Half Moon Bay (2026cahal) and adopt frc971's schedule while our matches aren't posted
    TEST_MODE: false,
    TEST_EVENTS: ['2026cahal', '2026capoh'],
    TEST_SCHEDULE_TEAM: 'frc971',
    // When true, load BreakerBots main.css as base (for deployment on breakerbots.com)
    BREAKERBOTS_CSS: false
};
})();
