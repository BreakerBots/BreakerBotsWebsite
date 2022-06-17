


var year = getCurrentYear();
var teamNum = "5104";



var sb, testEvent;
var prevMatchResult = "UNKNOWN";

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

testEvent = "2022camb";

function getActiveEventName() {
  var events;
  events = getJsonFromUrl("https://api.statbotics.io/v1/team_events/team/" + teamNum + "/year/" + year + "?format=json");

  for (var event in events){
    if (event["status"] === "active") {
        return event["event_name"];
    }
  }
    return testEvent;
}

function getCurrentYear() {
  let cur = new Date();
  return cur.getFullYear().toString();
}

function getAllTeamMatches() {
  return getJsonFromUrl("https://api.statbotics.io/v1/team_matches/team/" + teamNum + "/event/" + getActiveEventName() + "?format=json");
}

function getJsonFromUrl(jsonUrl) {
    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", jsonUrl, false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

function getNextMatchName() {
    matches = getAllTeamMatches();
  for (let i = 0; i < matches.length; i++) {
    if (matches[i]["status"] !== "Completed") {
      return matches[i]["match"];
    }
  }
  return matches[3]['match']
}

function getPrevMatchName() {
  matches = getAllTeamMatches();
  for (let i = 0; i < matches.length; i++) {
    if (matches[i]["status"] !== "Completed" && i > 0) {
      return matches[i-1]["match"];
    }
  }
  return matches[2]['match']
}

function getMatchJson(matchName) {
  return getJsonFromUrl("https://api.statbotics.io/v1/match/" + matchName + "?format=json");
}

function getDispMatchName(json) {
  if (json["comp_level"] === "qm") {
    return "Qualification" + " - " + json["match_number"].toString();
  } else {
    if (json["comp_level"] === "qf") {
      return "Quarter Final" + " - " + json["match_number"].toString();
    } else {
      if (json["comp_level"] === "sf") {
        return "Semi Final" + " - " + json["match_number"].toString();
      } else {
        if (json["comp_level"] === "f") {
          return "Final" + " - " + json["match_number"].toString();
        }
      }
    }
  }
}

function getMatchOutcome(matchJsonFile, yourAlliance) {
  var prob;
  prob = matchJsonFile["mix_win_prob"];
  prob *= 100;

  if (matchJsonFile["mix_winner"] === yourAlliance && prob >= 35.0) {
    return "Win - " + prob.toString() + "%";
  } else {
    if (matchJsonFile["mix_winner"] !== yourAlliance && prob >= 35.0) {
      return "Loss - " + prob.toString() + "%";
    } else {
      return "Inconclisive: (" + matchJsonFile["mix_winner"] + " - " + prob.toString() + "%)";
    }
  }
}

function getNextMatchStringForPrint(matchJson) {
  matchJson = matchJson[0];
  var ally, next;
  ally = getJsonFromUrl("https://api.statbotics.io/v1/team_match/team/" + teamNum + "/match/" + matchJson["key"] + "?format=json")[0]["alliance"];
  console.log(getJsonFromUrl("https://api.statbotics.io/v1/team_match/team/" + teamNum + "/match/" + matchJson["key"] + "?format=json"));
  next = "\n\n======================================================================================================\n\n";
  next += "MATCH: " + getDispMatchName(matchJson) + "\n";
  next += "ALLIANCE: " + ally + "\n";
  next += "PROJECTED OUTCOME: " + getMatchOutcome(matchJson, ally) + "\n";
  next += "OUR TEAMS: " + matchJson[ally] + "\n";
  next += "OPPOSING TEAMS: " + matchJson[ally === "blue" ? "red" : "blue"] + "\n";
  next += "START TIME: " + getMatchStartTime(matchJson);
  next += "\n\n======================================================================================================\n\n";
  return next;
}

function getMatchStartTime(matchJson) {
  let date = new Date(matchJson["time"] * 1000)
  return date.toLocaleTimeString();
}

function getNextMatchStringForHTML(matchJson) {
    matchJson = matchJson[0];
  var ally, next;
  console.log(matchJson)
  ally = getJsonFromUrl("https://api.statbotics.io/v1/team_match/team/" + teamNum + "/match/" + matchJson["key"] + "?format=json")[0]["alliance"];
  next = "=====================================<br><br>";
  next += "MATCH: " + getDispMatchName(matchJson) + "<br>";
  next += "ALLIANCE: " + ally + "<br>";
  next += "PROJECTED OUTCOME: " + getMatchOutcome(matchJson, ally) + "<br>";
  next += "OUR TEAMS: " + matchJson[ally] + "<br>";
  next += "OPPOSING TEAMS: " + matchJson[((ally === "blue")? "red" : "blue")] + "<br><br>";
  return next;
}

window.onload = init;
  function init(){
    windowUpdate()
    windowUpdateLoop();
    updateCurrentTime();
    currentTimeUpdateLoop();
    calcPrevMatchWinLoss(getMatchJson(getPrevMatchName()));
  }

  async function windowUpdateLoop() {
    while (true) {
        await sleep(60000);
        windowUpdate();
        calcPrevMatchWinLoss(getMatchJson(getPrevMatchName()))
    }
  }

 function windowUpdate() {
  console.log("DATA UPDATED: ");
  document.getElementById("nextMatchStr").innerHTML = getNextMatchStringForHTML(getMatchJson(getNextMatchName()));
  document.getElementById("matchStartTime").innerHTML = "START TIME: " + getMatchStartTime(getMatchJson(getNextMatchName())[0]);
  document.getElementById("matchStartTime").style.color =  getJsonFromUrl("https://api.statbotics.io/v1/team_match/team/" + teamNum + "/match/" + getMatchJson(getNextMatchName())[0]["key"] + "?format=json")[0]["alliance"];
  console.log(getNextMatchStringForPrint(getMatchJson(getNextMatchName())));
  let current = new Date();
  let timeStamp = 'Last updated: ' + current.toLocaleString();
  document.getElementById("updateTimestamp").innerHTML = timeStamp;
  console.log(timeStamp);
 }

 async function currentTimeUpdateLoop() {
  while (true) {
    await sleep(1000)
    updateCurrentTime();
  }
}

function updateCurrentTime() {
  let current = new Date();
  document.getElementById("currentTime").innerHTML = "(Current Time: " + current.toLocaleTimeString() + ")    (Previous Match Result: " + getPrevMatchWinLoss() +")";
}

function getPrevMatchWinLoss() {
  return prevMatchResult
}

function getMatchScores(ally, json) {
  let ourScore = json[ally + "_score"];
  let oppScore = json[((ally === "blue")? "red" : "blue") + "_score"];
  return ourScore + " to " + oppScore;
}


function calcPrevMatchWinLoss(json) {
  json = json[0];
  let ally = getJsonFromUrl("https://api.statbotics.io/v1/team_match/team/" + teamNum + "/match/" + json["key"] + "?format=json")[0]["alliance"];
  if (json["winner"] === ally) {
    prevMatchResult = "WIN | " + getMatchScores(ally, json);
  } else {
    prevMatchResult = "LOSS | " + getMatchScores(ally, json);
  }
}

async function calcPrevMatchWinLossLoop() {
  while (true) {
    await sleep(60000)
    calcPrevMatchWinLoss(getMatchJson(getPrevMatchName()))
  }
}



