//Switch To Tab To Select Tab From Url
var ctab = getUrlParameterByName('tab', ''); if (ctab == null) { ctab = 'General'; }
document.getElementById(ctab).classList.add('active');
function getUrlParameterByName(name, url) { if (!url) url = window.location.href; name = name.replace(/[\[\]]/g, "\\$&"); var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url); if (!results) return null; if (!results[2]) return ''; return decodeURIComponent(results[2].replace(/\+/g, " ")); }
