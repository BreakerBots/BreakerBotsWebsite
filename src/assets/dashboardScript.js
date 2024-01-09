
var year = 2023;//getCurrentYear();
var teamNum = "frc5104";
var activeEventStatusJson;
var eventProjectionJson;
var nextMatchJson;
var prevMatchJson;

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}


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
            nextMatchJson = await getMatchJson(events[event].next_match_key);
            eventProjectionJson = await getJsonFromURL("https://www.thebluealliance.com/api/v3/event/"+ event +"/predictions");
            prevMatchJson = await getMatchJson(events[event].last_match_key);
        }
    } 
    if (nextMatchJson == null)  {
      nextMatchJson = await getMatchJson("2023camb_qm11");
      prevMatchJson = await getMatchJson("2023camb_qm3");
      eventProjectionJson = await getJsonFromURL("https://www.thebluealliance.com/api/v3/event/2023camb/predictions");
    }
}
var player;
var twitchEmbedInit = function() {
  let scaiar = 70;
  var options = {
    width: 16*scaiar,
    height: 9*scaiar,
    channel: "piratesoftware"
  };
   player = new Twitch.Player("twitch-embed", options);
  player.setVolume(0.5);
  
};



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

async function getStatboticsJsonFromURL(url) {
  const res = await fetch(url, {
    method: "GET",
    withCredentials: false,
    headers: {
      'accept': 'application/json'
    }
  })
  const json = await res.json();
  return json;
}

function getNextMatchStartTime() {
    let date = new Date(nextMatchJson.time * 1000);
    return date.toLocaleTimeString();
}

function getNextMatchTimeRemaining() {
  let nextTs = new Date(nextMatchJson.time * 1000).getTime();
  let curTs = Date.now();
  //let curTs = new Date(nextMatchJson.time * 1000).getTime() - 30*60*1000;
  let diffMs = nextTs - curTs;
  return msToTime(diffMs);
}

function msToTime(duration) {

  if (duration >= 0.0) {
    var milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  } else {
    hours ="0";
    minutes = "0";
    seconds = "0";
    milliseconds = "0";
  }
  

  return hours + "h " + minutes + "m " + seconds + "." + milliseconds + "s";
}

function getNextMatchAllianceColor() {
    for (var key in nextMatchJson.alliances.blue.team_keys) {
        if (key === teamNum) {
            return "blue";
        }
    }
    return "red";
}

function getNextMatchOpponentAllianceColor() {
  for (var key in nextMatchJson.alliances.red.team_keys) {
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

async function updateNextMatchTeams() {
  updateTeam("blue",0);
  updateTeam("blue",1);
  updateTeam("blue",2);
  updateTeam("red",0);
  updateTeam("red",1);
  updateTeam("red",2);
}

function formatPercent(percent) {
  return Math.round((percent * 1000))/10 + "%";
}

async function updateTeam(ally, index) {
  const teamNums = getFormatedNextMatchTeamNums(ally);
  document.getElementById(ally+"_"+index+"_num").innerHTML = teamNums[index];
  teamStatsJson = await getStatboticsJsonFromURL("https://api.statbotics.io/v2/team_year/"+teamNums[index]+"/" + year);
  document.getElementById(ally+"_"+index+"_auto_epa").innerHTML = teamStatsJson["auto_epa_end"];
  document.getElementById(ally+"_"+index+"_tele_epa").innerHTML = teamStatsJson["teleop_epa_end"];
  document.getElementById(ally+"_"+index+"_end_epa").innerHTML = teamStatsJson["endgame_epa_end"];
  document.getElementById(ally+"_"+index+"_norm_epa").innerHTML = teamStatsJson["norm_epa_end"];
  document.getElementById(ally+"_"+index+"_perc").innerHTML =formatPercent(teamStatsJson["total_epa_percentile"]);
}

function updateDoc() {
    document.getElementById("next_match_name").innerHTML = getDispMatchName(nextMatchJson);
    document.getElementById("next_match_time").innerHTML = getNextMatchStartTime();
    document.getElementById("next_match_eta").innerHTML = getNextMatchTimeRemaining();
    let current = new Date();
    let timeStamp = 'Last updated: ' + current.toLocaleString();
    document.getElementById("last_update").innerHTML = timeStamp;
    updateNextMatchTeams();

}

function getPrevMatchWinLoss() {
    //if (activeEventStatusJson.next_match_key != null) {
        var ally = "red";
        for (var key of prevMatchJson.alliances.blue.team_keys) {
            if (key === teamNum) {
                ally = "blue";
            }
        }
        ourPts = prevMatchJson.alliances[ally].score;
        oppPts = prevMatchJson.alliances[ally === "blue" ? "red" : "blue"].score;
        return (prevMatchJson.winning_alliance === ally ? "Win" : "Loss") + " | " + ourPts + " to " + oppPts + ")";
    // }
    //     return "N/A";
}

function updateCurrentTime() {
    let pmr = getPrevMatchWinLoss();
    let current = new Date();
    document.getElementById("time").innerHTML = current.toLocaleTimeString();
}

window.onload = init;
  async function init(){
    await updateJSONs();
    loadScript("https://embed.twitch.tv/embed/v1.js", twitchEmbedInit);
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