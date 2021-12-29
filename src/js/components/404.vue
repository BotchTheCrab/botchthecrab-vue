<style lang="scss">

  #not-found-container {
    visibility: hidden;
  }

</style>

<template>

  <div id="not-found-container" class="container-fluid center-content">

  	<!-- PAGE TITLE -->
  	<div class="page-title">Page Not Found.</div>

    <p>Curses! This URL goes nowhere. Maybe try ...</p>

    <p><a href="/archive">Botch's Transformers Box Art Archive</a></p>

    <p><a href="/">Botch's Office</a></p>

    <p><a href="/postings">Search the Site</a></p>

  </div>

</template>

<script>

  // REDIRECT FUNCTIONS

  var params = {};
  var path = location.pathname;

  function handleRedirect() {
    console.info('handleRedirect ...');

    var queryString = location.search.substring(1);
    if (queryString) {
      var nameValuePairs = queryString.split('&');
      _.each(nameValuePairs, function(nameValue) {
        var split = nameValue.split('=');
        params[split[0]] = split[1];
      })
    }
    console.info('params ...');
    console.info(params);

    var lastCharacterIndex = path.length - 1;
    if (path.charAt(lastCharacterIndex) === '/') {
      path = path.substring(0, lastCharacterIndex);
    }
    console.info('path ...');
    console.info(path);

    var isBlog = path.indexOf('/replies') === 0;
    var isArchive = path.indexOf('/archive') === 0;
    var isGallery = path.indexOf('/gallery') === 0;
    var isAbout = path.indexOf('/about') === 0;

    console.info({
      isBlog: isBlog,
      isArchive: isArchive,
      isGallery: isGallery,
      isAbout: isAbout
    });

    if (isBlog) {
      redirectBlogPost();
    } else if (isArchive) {
      redirectArchive();
    } else if (isGallery) {
      redirectGallery();
    } else if (isAbout) {
      redirectAbout();
    } else {

      if (path.indexOf('/searchNew') === 0) {
        redirectPath('/postings?search=' + params.keywords);
      } else if (path.indexOf('/taglist') === 0) {
        redirectPath('/tags');
      } else if (path.indexOf('/galleries') === 0) {
        redirectPath('/galleries');
      } else if (path.indexOf('/misc') === 0) {
        redirectPath('/archive/reinforcements');
      } else {
        console.info('show not found');
        console.info({
          length: Number($('#not-found-container').length)
        });;
        $('#not-found-container').css('visibility', 'visible');
      }

    }
  }

  function redirectBlogPost() {
    redirectPath('/posting/' + params.index);
  }

  function redirectArchive() {

    var isTeletran = path.indexOf('/teletran.asp') !== -1;
    var isMicromaster = path.indexOf('/micromaster.asp') !== -1;
    var isActionMasters = path.indexOf('/nucleon.asp') !== -1;
    var isJapan = path.indexOf('/teletran2.asp') !== -1;
    var isEurope = path.indexOf('/teletran3.asp') !== -1;
    console.info({
      isTeletran: isTeletran,
      isMicromaster: isMicromaster,
      isActionMasters: isActionMasters,
      isJapan: isJapan,
      isEurope: isEurope
    });

    if (isTeletran && params.coat && params.year) {
      redirectPath('/archive/teletran/' + params.coat + '/' + params.year);

    } else if (isMicromaster && params.team) {

      // Initialize Firebase
      var firebaseConfig = {
        apiKey: "AIzaSyCWCpbe1wdg1v1uJqPZRGv0q6pT8QZiscE",
        authDomain: "botch-the-crab.firebaseapp.com",
        databaseURL: "https://botch-the-crab.firebaseio.com",
        projectId: "botch-the-crab",
        storageBucket: "botch-the-crab.appspot.com",
        messagingSenderId: "957369815270",
        appId: "1:957369815270:web:3ca19aaadf385f84632b27"
      };
      firebase.initializeApp(firebaseConfig);

      firebase.database().ref('archive/transformers_usa').once('value').then(function(snapshot) {
        var teamName = decodeURI(params.team);
        var micromasterTeams = _.where(snapshot.val(), { areMicromasters: true });
        var matchingTeam = _.findWhere(micromasterTeams, { name: teamName });
        if (matchingTeam) {
          redirectPath('/archive/teletran/' + pathWash(matchingTeam.faction) + '/' + pathWash(matchingTeam.year) + '/' + pathWash(teamName));
        }
      });

    } else if (isActionMasters && params.coat) {
      redirectPath('/archive/teletran/' + params.coat + '/action_masters');

    } else if (isJapan && params.coat) {

      if (params.coat === 'cybertron') {
        redirectPath('/archive/teletran/autobot/japan');
      }
      if (params.coat === 'destron') {
        redirectPath('/archive/teletran/decepticon/japan');
      }

    } else if (isEurope && params.coat) {
      redirectPath('/archive/teletran/' + params.coat + '/europe');
    }

    switch(path) {
      case '/archive':
        redirectPath('/archive');
        break;
      case '/archive/autobot':
        redirectPath('/archive/teletran/autobot');
        break;
      case '/archive/decepticon':
        redirectPath('/archive/teletran/decepticon');
        break;
      case '/archive/techspecs':
        redirectPath('/archive/techspecs');
        break;
      case '/archive/instructions':
        redirectPath('/archive/instructions');
        break;
      case '/archive/help.asp':
        redirectPath('/contact');
        break;
      case '/archive/reinforcements.asp':
      case '/archive/history.asp':
        redirectPath(deAsp(path));
        break;
    }

  }

  function redirectGallery() {

    if (params.image) {
      redirectPath('/gallery/galleryEntry/' + params.image);
      return;
    }

    switch(params.gallery) {
      case '2':
        redirectPath('/archive/boxbattles');
        break;
      case '10':
        redirectPath('/archive/catalogs');
        break;
      default:
        redirectPath('/gallery/' + params.gallery)
    }

  }

  function redirectAbout() {
    switch(path) {
      case '/about':
        redirectPath('/about');
        break;
      case '/about/contact.asp':
        redirectPath('/contact');
        break;
      case '/about/adam.asp':
      case '/about/botch.asp':
      case '/about/music.asp':
      case '/about/trio.asp':
      case '/about/site.asp':
        redirectPath(deAsp(path));
        break;
    }
  }


  // UTILITY FUNCTIONS

  function pathWash(s) {
    s = String(s);
    s = s.replace(/[\s&\+]/g, '_');
    s = s.toLowerCase();
    return s;
  }

  function deAsp(path) {
    return path.replace('.asp', '');
  }

  function redirectPath(newPath) {
    location.replace(newPath);
  }


  module.exports = {

    mounted: handleRedirect

  };

</script>
