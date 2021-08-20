var storage = (typeof(Storage) !== 'undefined');
var now = new Date();
var one_year = new Date(now.getUTCFullYear() + 1, now.getUTCMonth(), now.getUTCDate() );

module.exports = {

  /* set local storage, or cookie if Storage is not supported */
  setCookie: function(name,value,expires,path,domain,secure) {
    if (storage) {
      localStorage[name] = value;
    } else {
      expires = expires || one_year;

      document.cookie = name + "=" + value +
      ((expires)	? ";expires=" + expires.toUTCString() : "") +
      ((path)		? ";path=" + path : "") +
      ((domain)	? ";domain=" + domain : "") +
      ((secure)	? ";secure" : "");
    }
  },

  /* read local storage, cookies if Storage is not supported or value is absent */
  readCookie: function(cookieName) {

    if (storage && localStorage[cookieName]) {

      return localStorage[cookieName];

    } else if (document.cookie) {

      var whichChip = new RegExp("\\b" + cookieName + "=", "i");
      var index = document.cookie.search(whichChip);

      if (index != -1) {

        // Find the start
        cookieStart = index + cookieName.length + 1;

        // Find the end
        cookieStop = document.cookie.indexOf(";", index);
        if (cookieStop == -1) { cookieStop = document.cookie.length }

        // with the start and the end... now you've got the whole thing
        return document.cookie.substring(cookieStart, cookieStop)
      }

      else return false;

    }
    return false;
  }

}
