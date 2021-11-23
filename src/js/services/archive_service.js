var fancyboxService = require('services/fancybox_service.js');

module.exports = {
  getCurrentFactionFromRoute: getCurrentFactionFromRoute,
  getCurrentYearFromRoute: getCurrentYearFromRoute,
  getFactionClass: getFactionClass,
  toTitleCase: toTitleCase,
  pathWash: pathWash,
  pathUnwash: pathUnwash,
  tf: tf
};

////////////

function getCurrentFactionFromRoute(route) {
  if (route.indexOf('autobot') !== -1) {
    return 'Autobot';
  } else if (route.indexOf('decepticon') !== -1) {
    return 'Decepticon';
  }
  return null;
}

function getCurrentYearFromRoute(route) {
  var parseYear = route.match(/\d{4}/);
  if (Array.isArray(parseYear) && parseYear.length) {
    return Number(parseYear[0]);
  }
  return null;
}

function getFactionClass (faction) {
  if (faction === "Autobot" || faction === "Cybertron") {
    return 'autobot';
  } else if (faction === "Decepticon" || faction === "Destron") {
    return 'decepticon';
  }
  return '';
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

/* shift to lowercase and replace non-word characters with underscores */
/* ex: "Optimus Prime" becomes "optimus_prime" */
function pathWash(s) {
  s = String(s);
  // s = s.replace(/[\s&]/g, '_');
  s = s.replace(/[\s]/g, '_');
  s = s.toLowerCase();
  return s;
}

/* replace underscores with spaces and shift to title case */
/* ex: "optimus_prime" becomes "Optimus Prime" */
function pathUnwash(s) {
  s = String(s);
  s = s.replace(/_/g, ' ');
  s = this.toTitleCase(s);
  return s;
}

/* load a box art entry from a posting (legacy function) */
function tf(tfName, tfFaction, tfSub, tfTeam) {
  if (tfFaction === "Cybertron") {
    tfFaction = "Autobot";
  }
  if (tfFaction === "Destron") {
    tfFaction = "Decepticon";
  }

  var imgSrc = null
  if (tfSub === 'Japan' || tfSub === 'Europe') {

    // Japanese or European
    imgSrc = pathWash('/archive/' + tfFaction + '/' + tfSub + '/' + tfName + '.jpg');

  } else if (tfSub === 'ActionMasters') {
    // Action Masters
    imgSrc = pathWash('/archive/' + tfFaction + '/action_masters/' + tfName + '.jpg');

  } else if (tfTeam) {
    // US Micromasters
    imgSrc = pathWash('/archive/' + tfFaction + '/' + tfSub + '/' + tfTeam + '/' + tfName + '.jpg');
  } else {
    // US
    imgSrc = pathWash('/archive/' + tfFaction + '/' + tfSub + '/' + tfName + '.jpg');
  }

  if (imgSrc) {
    fancyboxService.openImage(tfName, imgSrc);
  }
  return false;
}
