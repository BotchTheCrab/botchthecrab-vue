<style>
  /* */
</style>

<template>

  <div class="container-fluid">

    <archive-header></archive-header>

    <teletran-header v-bind:faction="faction" v-bind:year="year"></teletran-header>

    <div id="teletran-container" v-bind:class="containerClass" v-cloak>
      <teletran-entry v-for="entry in transformers" v-bind:entry="entry" v-bind:key="entry.transformerId" v-show="!loading"></teletran-entry>
      <teletran-next v-bind:faction="faction" v-bind:year="year" v-bind:key="$route.fullPath" v-show="!loading"></teletran-next>
    </div>

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
  var TeletranNextVue = require('components/archive/partials/teletran_next');

  module.exports = {

    data () {
      return {
        faction: null,
        year: null,
        displayFaction: null,
        displayYear: null,
        transformers: [],
        loading: true
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue,
      'teletran-header': TeletranHeaderVue,
      'teletran-entry': TeletranEntryVue,
      'teletran-next': TeletranNextVue
    },

    beforeMount() {
      this.updateState();
    },

    watch: {
      $route: function(to, from) {
        this.updateState();
      }
    },

    mounted() {
    },

    methods: {

      updateState: function() {
        var vm = this;

        vm.loading = true;

        _.extend(this, {
          faction: this.$route.params.faction,
          year: this.$route.params.year
        });

        var displayFaction = archiveService.toTitleCase(this.faction);
        var displayYear = Number(this.year);
        if (isNaN(displayYear)) {
          // action masters, japan, europe
          displayYear = archiveService.pathUnwash(this.year);
        }
        _.extend(this, {
          displayFaction: displayFaction,
          displayYear: displayYear
        });

        this.updateTitle();

        // set body class
        // var factionClass = archiveService.getFactionClass(this.displayFaction);
        // globalService.setBodyClass(factionClass);

        // var vm = this;

        var dataReference = 'transformers_usa';
        if (this.year === 'action_masters') {
          dataReference = 'action_masters';
        } else if (this.year === 'japan') {
          dataReference = 'transformers_japan';
        } else if (this.year === 'europe') {
          dataReference = 'transformers_europe';
        }

        // fetch characters
        firebase.database().ref('archive/' + dataReference).once('value').then(function(snapshot) {

          var transformers = snapshot.val();

          var filteredTransformers = _.chain(transformers)
            .filter(function(transformer) {

              if (vm.year === 'action_masters') {
                return transformer.faction === displayFaction && transformer.region === 'USA';
              } else if (vm.year === 'japan' || vm.year === 'europe') {
                return transformer.faction === displayFaction;
              }

              return transformer.faction === displayFaction && transformer.year === displayYear;
            })
            .sortBy('name')
            .value();

          // not a fan of this, but simply resetting the array doesn't update the view
          vm.transformers.splice(filteredTransformers.length);
          _.each(filteredTransformers, function(transformer, index) {
            Vue.set(vm.transformers, index, filteredTransformers[index]);
          });

          vm.loading = false;

        }, function(error) {
          console.error(error);
        });

      },

      updateTitle: function() {
        globalService.setArchiveDocumentTitle(this.displayYear + " " + this.displayFaction + "s");
      }

    },

    computed: {

      containerClass: function() {
        if (this.year === 'japan') {
          return 'teletran-container-japan';
        }
        return '';
      }

    }


  };

</script>
