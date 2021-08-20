<style>
  /* */
</style>

<template>

  <div class="container-fluid">

    <archive-header></archive-header>

    <teletran-header v-bind:faction="faction"></teletran-header>

    <div id="teletranContainer" v-bind:class="containerClass" v-cloak>
      <teletran-year-entry v-for="desination in destinations" v-bind:desination="desination" v-bind:key="desination.year"></teletran-year-entry>
    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  // var fancyboxService = require('services/fancybox_service');
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');
  var TeletranHeaderVue = require('components/archive/partials/teletran_header');
  var TeletranYearEntryVue = require('components/archive/partials/teletran_year_entry');

  module.exports = {

    data () {
      return {
        faction: null,
        displayFaction: null,
        destinations: []
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue,
      'teletran-header': TeletranHeaderVue,
      'teletran-year-entry': TeletranYearEntryVue
    },

    beforeMount() {
      this.updateState();
    },

    watch: {
      $route(to, from) {
        this.updateState();
      }
    },

    mounted() {
      globalService.setArchiveDocumentTitle(this.displayFaction + "s");
    },

    methods: {

      updateState: function() {

        _.extend(this, {
          faction: this.$route.params.faction
        });

        var displayFaction = archiveService.toTitleCase(this.faction);
        _.extend(this, {
          displayFaction: displayFaction
        });

        // set body class
        // var factionClass = archiveService.getFactionClass(this.displayFaction);
        // globalService.setBodyClass(factionClass);

        var isAutobot = this.faction === 'autobot';

        var destinations = [
          { faction: this.faction, year: 1984, character: isAutobot ? "Optimus Prime" : "Megatron" },
          { faction: this.faction, year: 1985, character: isAutobot ? "Grimlock" : "Devastator" },
          { faction: this.faction, year: 1986, character: isAutobot ? "Ultra Magnus" : "Galvatron" },
          { faction: this.faction, year: 1987, character: isAutobot ? "Fortress Maximus" : "Scorponok" },
          { faction: this.faction, year: 1988, character: isAutobot ? "Waverider" : "Bomb-Burst" },
          { faction: this.faction, year: 1989, character: isAutobot ? "Ironworks" : "Airwave" },
          { faction: this.faction, year: 1990, character: isAutobot ? "Battlefield Headquarters" : "Cannon Transport" },
          { faction: this.faction, year: 'action_masters', text: "Action Masters", character: isAutobot ? "Mainframe" : "Krok" },
          { faction: this.faction, year: 'japan', text: "Japanese Exclusives", character: isAutobot ? "Star Saber" : "Deszaras" },
          { faction: this.faction, year: 'europe', text: "European Exclusives", character: isAutobot ? "Thunder Clash" : "Overlord" }
        ];

        this.destinations = destinations;

      }

    }


  };

</script>
