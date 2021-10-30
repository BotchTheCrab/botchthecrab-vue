<style lang="scss">

  .teletran-sort {
    margin: 0 auto;
    width: 90%;
    max-width: 400px;
    border: 1px solid #222;
    margin-top: 10px;
    margin-bottom: 20px;
    text-align: center;
    padding: 3px 2px;

    color: #999;
    font-variant: small-caps;

    a[selected="selected"] {
      color: white;
      &:hover {
        text-decoration: none;
      }
    }
  }

</style>

<template>

  <div class="container-fluid">

    <archive-header></archive-header>

    <teletran-header v-bind:faction="faction" v-bind:year="year"></teletran-header>

    <div class="teletran-sort" v-if="year === 'japan'"><label>Sort By:</label> <a v-on:click="updateSort('releaseId')" v-bind:selected="japanSortMethod === 'releaseId'">Release Number</a> | <a v-on:click="updateSort('name')" v-bind:selected="japanSortMethod === 'name'">Name</a></div>

    <div id="teletran-container" v-bind:class="containerClass" v-cloak>
      <teletran-entry v-for="entry in transformers" v-bind:entry="entry" v-bind:key="entry.transformerId" v-show="!loading"></teletran-entry>
      <teletran-next v-bind:faction="faction" v-bind:year="year" v-bind:key="$route.fullPath" v-show="!loading"></teletran-next>
    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');
  var cookiesService = require('services/cookies_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');
  var TeletranHeaderVue = require('components/archive/partials/teletran_header');
  var TeletranEntryVue = require('components/archive/partials/teletran_entry');

  // TELETRAN (PAGE) COMPONENTS
  var TeletranNextVue = require('components/archive/partials/teletran_next');

  var vm;

  module.exports = {

    data () {
      return {
        faction: null,
        year: null,
        displayFaction: null,
        displayYear: null,
        transformers: [],
        japanSortMethod: 'releaseId',
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
      vm = this;
      vm.updateState();
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
            .value();

          if (vm.year === 'japan') {
            var japanSort = cookiesService.readCookie('japan-sort') || 'releaseId';
            filteredTransformers = _.sortBy(filteredTransformers, japanSort);
            vm.japanSortMethod = japanSort;
          } else {
            filteredTransformers = _.sortBy(filteredTransformers, 'name');
          }

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

      updateSort: function(sortMethod) {
        sortMethod = sortMethod || 'name';
        vm.transformers = _.sortBy(vm.transformers, sortMethod);
        vm.japanSortMethod = sortMethod;
        cookiesService.setCookie('japan-sort', sortMethod);
        return false;
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
