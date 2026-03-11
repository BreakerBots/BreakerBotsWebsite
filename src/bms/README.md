# Breaker Match Scouter

Mobile webapp for Team 5104 match scouting — 2026 REBUILT season. HTML, CSS, and JavaScript only. Uses The Blue Alliance API for data.

## Features

- **Landing**: Team logo and links to events team 5104 is registered for
- **Event page**: Match list (TBA-style) — Red vs Blue alliances with scores
- **Match page**: Scouting report for all 6 teams (OPR, rank, tower %, RP bonuses, prediction)

## Running

Serve the directory over HTTP (required for TBA API fetch). For example:

```bash
cd bms
python3 -m http.server 8080
```

Then open http://localhost:8080

Or use `npx serve` or any static file server.

## Configuration

- **TBA API key**: Uses project default. Override in browser console: `localStorage.setItem('TBA_API_KEY', 'your-key')`
- **Team**: Hardcoded to `frc5104` in `js/config.js`
- **Test mode**: When our events have no matches yet, set `TEST_MODE: true` in `js/config.js` to use Half Moon Bay (2026cahal) and 2026capoh with frc971's schedule. Set to `false` when real matches are posted.
- **BreakerBots styling**: Uses BreakerBots brand colors (#af1700, #fab01d). For deployment on [breakerbots.com](https://breakerbots.com), set `BREAKERBOTS_CSS: true` in `js/config.js` to load their main.css as a base.

## 2026 REBUILT Stats

- **Tower**: Auto + Endgame tower points (Level1/2/3)
- **RP**: Energized (100 fuel), Supercharged (360 fuel), Traversal (50 tower)
