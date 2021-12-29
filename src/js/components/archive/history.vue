<style lang="scss">

  #history-import {
    font-size: 1em;
    text-align: justify;
    max-width: 800px;
    margin: 0 auto 50px;

    img {
      max-width: 200px;
    }
    .thumbinner {
      width: auto !important;
    }
  }

  #toc,
  #TemplateUserinfo,
  #history-import center,
  #history-import h4,
  #history-import h3,
  .editsection,
  .magnify,
  .autonumber,
  .thumbcaption
  { display: none; }

  div.tleft {
    float: left;
    clear: left;
    margin: 0 10px 10px 0;
  }

  div.tright {
    float: right;
    clear: right;
    margin: 0 0 10px 10px;
  }

  div.thumbinner {
    background-color:#F9F9F9;
    border:1px solid #CCCCCC;
    font-size:94%;
    overflow:hidden;
    padding:3px !important;
    text-align:center;
    color:black;
  }

  .thumbcaption {
    padding:3px !important;
    text-align:left;
    font-size: 10px;

    a { color: blue; }
  }

  .thumbimage {
    border:1px solid #CCCCCC;
  }

  .history-credits {
    margin: 0 auto 15px;
    max-width: 800px;
    font-size: 0.8em;
    text-align: center;
    color: #ccc;
    background-color: #222;
    box-shadow: 2px 2px 3px #333;
    padding: 10px;

    div {
      margin-bottom: 3px;
      font-size: 1.2em;
    }
  }

  .loading,
  .load-error {
    text-align: center;
  }

</style>

<template>

  <div class="container-fluid" id="Reinforcements">

    <archive-header></archive-header>

    <div class="teletran-header">
  		<span class="teletran-header-neutral">Box Art History</span>
  	</div>

    <div id="history-import" v-html="parsedHistoryMarkup"></div>

    <div class="history-credits">
  		<div><b>What now?</b></div>
  		<div>&#0149; Start browsing Generation One box art with either the heroic <a href="/archive/teletran/autobot"><b>Autobots</b></a> or the evil <a href="/archive/teletran/decepticon"><b>Decepticons</b></a>!</div>
  		<div>&#0149; Continue reading about box art <i>after</i> Generation One by visiting the <a href="http://tfwiki.net/wiki/Package_art" target="tfwiki">Package Art</a> page of <a href="http://tfwiki.net/" target="tfwiki">TFWiki.net</a>.</div>
  	</div>

  	<div class="history-credits">
  		The contents of this page are scraped in real time from the <a href="http://tfwiki.net/wiki/Package_art" target="tfwiki">Package Art</a> article of the incredible <a href="http://tfwiki.net/" target="tfwiki">TFWiki.net</a> via <a href="https://allorigins.win/" target="allorigins">allorigins.win</a>.<br />
  		Special thanks to <a href="http://deriksmith.livejournal.com/" target="derik"><b>Derik in Minnesota</b></a>, a web developer who blogs about content licensing, Transformers and other crazy stuff.<br />
  	</div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');
  var TeletranEntryVue = require('components/archive/partials/teletran_entry');

  var vm;

  module.exports = {

    data () {
      return {
        parsedHistoryMarkup: '<div class="loading">Loading history ...</div>'
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue,
      'teletran-entry': TeletranEntryVue
    },

    beforeMount() {
      vm = this;
      vm.getBoxArtHistory();
    },

    mounted() {
      globalService.setArchiveDocumentTitle("Box Art History");
    },

    methods: {

      getBoxArtHistory: function() {

        var boxArtUrl = "https://tfwiki.net/w2/index.php?title=Package_art&action=render";
        var corsProxy = "https://api.allorigins.win/get?url=";

        $.getJSON(corsProxy + encodeURIComponent(boxArtUrl), function (data) {
            var markup = data && data.contents;

            var startingIndexMarker = '<div class="thumb tright">';
            var startingIndex = markup.indexOf(startingIndexMarker);

            var endingIndexMarker = '<h3> <span class="mw-headline" id="Generation_2"><i>Generation 2</i></span></h3>';
            var endingIndex = markup.indexOf(endingIndexMarker);

            if (startingIndex < 0 || endingIndex < 0) {
              console.error("Unable to find starting/ending indices.");
              vm.displayError();
              return;
            }

            var historyMarkup = markup.substring(startingIndex, endingIndex);

            historyMarkup = historyMarkup.replace(
              /src="\//g,
              'src="https://tfwiki.net/'
            );

            historyMarkup = historyMarkup.replace(
              / href=/g,
              ' target="tfwiki" href='
            );

            historyMarkup = historyMarkup.replace(/ width="\d+"/g, '');
            historyMarkup = historyMarkup.replace(/ height="\d+"/g, '');

            historyMarkup = historyMarkup.replace(
              'https://tfwiki.net/wiki/File:G1_OptimusPrime_boxart.jpg',
              '/postings?search=optimus%20prime'
            );

            historyMarkup = historyMarkup.replace(
              'https://tfwiki.net/wiki/File:Thunderwingboxart.jpg',
              '/postings?search=thunderwing'
            );

            historyMarkup = historyMarkup.replace(
              'https://tfwiki.net/wiki/File:G1_1984_backofboxbattle.jpg',
              '/archive/boxbattles'
            );

            historyMarkup = historyMarkup.replace(
              'https://tfwiki.net/wiki/File:SpaceshotAngry.jpg',
              '/archive/boxbattles'
            );

            vm.parsedHistoryMarkup = historyMarkup;
        })
        .fail(function(error) {
          console.error('FAILURE!');
          console.error(error);
          vm.displayError();
        });

      },

      displayError: function() {
        vm.parsedHistoryMarkup = '<div class="load-error">There was an error loading box art history.</div>';
      }
    }

  };

</script>
