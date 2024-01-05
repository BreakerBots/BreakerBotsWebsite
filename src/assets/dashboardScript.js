var year = 2023;//getCurrentYear();
var teamNum = "frc5104";
var activeEventStatusJson;
var eventProjectionJson;
var nextMatchJson;
var prevMatchJson;

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function getCurrentYear() {
    let cur = new Date();
    return cur.getFullYear().toString();
}

async function updateJSONs() {
    var events = await getJsonFromURL("https://www.thebluealliance.com/api/v3/team/" + teamNum + "/events/" + year + "/statuses");
    activeEventStatusJson = events["2023camb"];
    for (var event in events) {
        if (events[event].next_match_key != null) {
            activeEventStatusJson = events[event];
            nextMatchJson = await getMatchJson("2023camb_qm11"/*events[event].next_match_key*/);
            eventProjectionJson = await getJsonFromURL("https://www.thebluealliance.com/api/v3/event/"+ event +"/predictions");
            prevMatchJson = await getMatchJson("2023camb_qm10"/*events[event].last_match_key*/);
            console.log(nextMatchJson);
        }
    } 
}

async function getMatchJson(matchKey) {
    return await getJsonFromURL("https://www.thebluealliance.com/api/v3/match/" + matchKey);
}

async function getJsonFromURL(url) {
    const res = await fetch(url, {
      method: "GET",
      withCredentials: false,
      headers: {
        'accept': 'application/json',
        'X-TBA-Auth-Key': 'TQ79e7hQebH2ZWEoqDsNGQEwmBGi4gReFZAhx8VOEMq6POc7RxJMaFzikrN8URrB'
      }
    })
    const json = await res.json();
    return json;
}

function getNextMatchStartTime() {
    let date = new Date(nextMatchJson.time * 1000);
    return date.toLocaleTimeString();
}

function getNextMatchAllianceColor() {
    for (var key in nextMatchJson.alliances.blue.team_keys) {
        if (key === teamNum) {
            return "blue";
        }
    }
    return "red";
}

function getDispMatchName(json) {
    if (json.comp_level === "qm") {
      return "Qualification" + " - " + json.match_number.toString();
    } else {
      if (json.comp_level === "qf") {
        return "Quarter Final" + " - " + json.match_number.toString();
      } else {
        if (json.comp_level === "sf") {
          return "Semi Final" + " - " + json.match_number.toString();
        } else {
          if (json.comp_level === "f") {
            return "Final" + " - " + json.match_number.toString();
          }
        }
      }
    }
}

function getFormatedNextMatchTeamNums(ally) {
    var teamStrs = [];
    
    for (let i = 0; i < nextMatchJson.alliances[ally].team_keys.length; i++ ) {
        teamStrs[i] = " " + nextMatchJson.alliances[ally].team_keys[i].slice(3);
    }
    return teamStrs;
}

function getNextMatchProjectedOutcome() {
    var sub = eventProjectionJson["match_predictions"];
    var curLvl = sub[nextMatchJson.comp_level === "qm" ? "qual" : 'playoff'];
    var matchPred = curLvl[nextMatchJson.key].winning_alliance;
    var ourScore = Math.round(curLvl[nextMatchJson.key][getNextMatchAllianceColor()].score);
    var oppScore =  Math.round(curLvl[nextMatchJson.key][getNextMatchAllianceColor() === "blue" ? "red" : "blue"].score);
    return (matchPred === getNextMatchAllianceColor() ? "Win" : "Loss") + " (" + ourScore + " to " + oppScore + ")";
}

function getNextMatchStringForHTML() {
    var str = "";
    str += "MATCH: " + getDispMatchName(nextMatchJson) + "<br>";
    str += "ALLIANCE: " + getNextMatchAllianceColor() + "<br>";
    str += "PROJECTED OUTCOME: " + getNextMatchProjectedOutcome() + "<br>";
    str += "OUR TEAMS: " + getFormatedNextMatchTeamNums(getNextMatchAllianceColor()) + "<br>";
    str += "OPPOSING TEAMS: " + getFormatedNextMatchTeamNums(getNextMatchAllianceColor() === "blue" ? "red" : "blue") + "<br><br>";
    return str;
}

function updateDoc() {
    document.getElementById("nextMatchStr").innerHTML = getNextMatchStringForHTML();
    document.getElementById("matchStartTime").innerHTML = "START TIME: " + getNextMatchStartTime();
    document.getElementById("matchStartTime").style.color = getNextMatchAllianceColor();
    let current = new Date();
    let timeStamp = 'Last updated: ' + current.toLocaleString();
    document.getElementById("updateTimestamp").innerHTML = timeStamp;
}

function getPrevMatchWinLoss() {
    if (activeEventStatusJson.next_match_key != null) {
        var ally = "red";
        for (var key in prevMatchJson.alliances.blue.team_keys) {
            if (key === teamNum) {
                ally = "blue";
            }
        }
        ourPts = prevMatchJson.alliances[ally].totalPoints;
        oppPts = prevMatchJson.alliances[ally === "blue" ? "red" : "blue"].totalPoints;
        return (prevMatchJson.winning_alliance === ally ? "Win" : "Loss") + " | " + ourPts + " to " + oppPts + ")";
    }
        return "N/A";
}

function updateCurrentTime() {
    let pmr = getPrevMatchWinLoss();
    let current = new Date();
    document.getElementById("currentTime").innerHTML = "(Current Time: " + current.toLocaleTimeString() + ")    (Previous Match Result: " + pmr + ")";
}





window.onload = init;
  async function init(){
    await updateJSONs();
    updateDoc();
    updateCurrentTime();
    fastUpdateLoop();
    slowUpdateLoop();
  }

  async function fastUpdateLoop() {
    while(true) {
        await sleep(250);
        updateCurrentTime();
    }
  }

  async function slowUpdateLoop() {
    while (true) {
        await sleep(60000);
        await updateJSONs();
        updateDoc();
    }
  }