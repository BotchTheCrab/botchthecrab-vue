module.exports = {
  getCurrentRoute: getCurrentRoute,
  setBodyClass: setBodyClass,
  setOfficeDocumentTitle: setOfficeDocumentTitle,
  setArchiveDocumentTitle: setArchiveDocumentTitle,
  formatPosted: formatPosted,
	scrollTop: scrollTop
};

function getCurrentRoute() {
  return location.hash.substring(1);
}

function setBodyClass(currentRoute) {
  var className = '';
  if (currentRoute.indexOf('/autobot') !== -1) {
    className = "autobot";
  } else if (currentRoute.indexOf('/decepticon') !== -1) {
    className = "decepticon";
  }

  $('body').attr('class', className);
}

function setOfficeDocumentTitle(pageTitle) {
  document.title = "Botch the Crab" + (pageTitle ? " - " + pageTitle : "");
}

function setArchiveDocumentTitle(pageTitle) {
  document.title = "Botch's Transformers Box Art Archive" + (pageTitle ? " - " + pageTitle : "");
}

function formatPosted(posted) {
  var timestampParts = posted.split(' ');
  var datePart = timestampParts[0];
  var timePart = timestampParts[1]
  if (timePart === '00:00:00') {
    timePart = '';
  } else {
    timePart = timePart.substring(0,5);
  }

  return datePart + ' ' + timePart;
}

/* animated scroll to the top */
function scrollTop() {
  var body = $("html, body");
  body.animate({ scrollTop: 0 }, '250', 'swing');
}
