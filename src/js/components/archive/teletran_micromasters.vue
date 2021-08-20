<style>
  /* */
</style>

<template>

  <div class="container-fluid">

    <archive-header></archive-header>

    <teletran-header v-bind:faction="currentFaction" v-bind:year="currentYear"></teletran-header>

    <div id="micromasterTeamName">{{ teamName }}</div>

    <div id="teletranContainer" class="teletranContainerCentered" v-cloak>
      <teletran-entry v-bind:entry="teamEntry" v-if="teamEntry.transformerId"></teletran-entry>
      <teletran-entry v-for="entry in teammates" v-bind:entry="entry" v-bind:key="entry.micromasterId"></teletran-entry>
    </div>

    <teletran-back v-bind:faction="currentFaction" v-bind:year="currentYear"></teletran-back>
  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');
  var TeletranHeaderVue = require('components/archive/partials/teletran_header');
  var TeletranEntryVue = require('components/archive/partials/teletran_entry');

  // TELETRAN (PAGE) COMPONENTS
  var TeletranBackVue = require('components/archive/partials/teletran_back');

  module.exports = {

    data () {
      return {
        currentFaction: null,
        currentYear: null,
        teamName: null,
        teamEntry: {},
        teammates: []
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue,
      'teletran-header': TeletranHeaderVue,
      'teletran-entry': TeletranEntryVue,
      'teletran-back': TeletranBackVue
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
      globalService.setArchiveDocumentTitle(this.currentYear + " " + this.currentFaction + "s" + " - " + this.teamName);
    },

    methods: {

      getCurrentRoute: globalService.getCurrentRoute,

      updateState: function() {
        var currentFaction = archiveService.toTitleCase(this.$route.params.faction);
        var currentYear = Number(this.$route.params.year);

        var underscoreTeamName = this.$route.params.micromasterTeam;
        var teamName = archiveService.pathUnwash(underscoreTeamName);

        _.extend(this, {
          currentFaction: currentFaction,
          currentYear: currentYear,
          teamName: teamName
        });

        // set body class
        // var factionClass = archiveService.getFactionClass(this.currentFaction);
        // globalService.setBodyClass(factionClass);

        var vm = this;

        // fetch team entry
        firebase.database().ref('archive/transformers_usa').once('value').then(function(snapshot) {

          var transformers = snapshot.val();

          var teamEntry = _.chain(transformers)
            .where({ faction: currentFaction, year: currentYear, name: teamName })
            .sortBy('name')
            .value();

          vm.teamEntry = _.omit(teamEntry[0], 'areMicromasters');

        }, function(error) {
          console.error(error);
        });

        // fetch teammates
        firebase.database().ref('archive/micromasters').once('value').then(function(snapshot) {

          var micromasters = snapshot.val();

          var teammates = _.chain(micromasters)
            .where({ faction: currentFaction, year: currentYear, team: teamName })
            .sortBy('name')
            .value();

          vm.teammates.splice(teammates.length);
          _.each(teammates, function(teammate, index) {
            Vue.set(vm.teammates, index, teammates[index]);
          });

        }, function(error) {
          console.error(error);
        });

      }

    }


  };

</script>
