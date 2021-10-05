<style lang="scss">

  #BotchTechSpec {
  	padding: 50px 0;
  	margin: 0 auto;
  	font-size: 0.9em;
  	clear: both;

  	& > div {
  		margin-bottom: 10px;
  	}

  	img {
  		width: 100%;
  		max-width: 400px;
  	}

  	a {
  		white-space: nowrap;
  	}

  }

</style>

<template>

  <div class="container-fluid">

    <archive-header></archive-header>

    <div class="teletran-header">
  		<span class="teletran-header-neutral">Tech Specs</span>
  	</div>

    <p class="archive-paperwork-credits">
  		Eternal thanks to <b>Jon and Karl Hartman</b>, the original curators of the Transfomers G1 Tech Spec Scan Archive.
  	</p>

    <div class="col-sm-6">

      <div class="archive-paperwork-autobot">Autobots</div>

      <div class="archive-paperwork-year" v-for="year in yearsUsa" v-if="techspecs.usa.autobots[year].length">
        <div class="archive-paperwork-year-header">{{ getDisplayYear(year) }}</div>
        <div class="archive-paperwork-year-content">
          <div v-for="entry in techspecs.usa.autobots[year]">
            <a class="fancybox-button-techspecs" rel="fancybox-button" v-bind:title="entry.name + ' - Tech Specs'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>

    <div class="col-sm-6">

      <div class="archive-paperwork-decepticon">Decepticons</div>

      <div class="archive-paperwork-year" v-for="year in yearsUsa" v-if="techspecs.usa.decepticons[year].length">
        <div class="archive-paperwork-year-header">{{ getDisplayYear(year) }}</div>
        <div class="archive-paperwork-year-content">
          <div v-for="entry in techspecs.usa.decepticons[year]">
            <a class="fancybox-button-techspecs" rel="fancybox-button" v-bind:title="entry.name + ' - Tech Specs'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>

    <!-- BOTCH's TECH SPEC -->
		<div id="BotchTechSpec">
			<div>
        <a class="fancybox-button-techspecs" rel="fancybox-button" title="Botch - Tech Specs" href="/images/botch/botch_techspec.jpg" target="_blank"><img src="/images/botch/botch_techspec_small.jpg"></a>
			</div>
			<div>Botch's custom tech spec courtesy of <a href="http://www.ocf.berkeley.edu/~mingus/tech/" target="Credit">Slim's Custom Transformers Tech Specs</a>.</div>
		</div>

    <div class="col-sm-6">

			<div class="archive-paperwork-autobot">Autobots (European)</div>

      <div class="archive-paperwork-year" v-for="year in yearsEurope" v-if="techspecs.europe.autobots[year].length">
        <div class="archive-paperwork-year-header">{{ getDisplayYear(year) }}</div>
        <div class="archive-paperwork-year-content">
          <div v-for="entry in techspecs.europe.autobots[year]">
            <a class="fancybox-button-techspecs" rel="fancybox-button" v-bind:title="entry.name + ' - Tech Specs'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>

    <div class="col-sm-6">

			<div class="archive-paperwork-decepticon">Decepticons (European)</div>

      <div class="archive-paperwork-year" v-for="year in yearsEurope" v-if="techspecs.europe.decepticons[year].length">
        <div class="archive-paperwork-year-header">{{ getDisplayYear(year) }}</div>
        <div class="archive-paperwork-year-content">
          <div v-for="entry in techspecs.europe.decepticons[year]">
            <a class="fancybox-button-techspecs" rel="fancybox-button" v-bind:title="entry.name + ' - Tech Specs'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>


  </div>

</template>

<script>

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');

  var yearsUsa = [1984, 1985, 1986, 1987, 1988, 1989, 1990, 'action_masters'];
  var yearsEurope = [1990, 1991, 1992, 1993, 'action_masters'];

  var techspecsDataModel = {
    usa: {
      autobots: {},
      decepticons: {}
    },
    europe: {
      autobots: {},
      decepticons: {}
    }
  };
  _.each(yearsUsa, function(year) {
    techspecsDataModel.usa.autobots[String(year)] = [];
    techspecsDataModel.usa.decepticons[String(year)] = [];
  });
  _.each(yearsEurope, function(year) {
    techspecsDataModel.europe.autobots[String(year)] = [];
    techspecsDataModel.europe.decepticons[String(year)] = [];
  });

  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {

        yearsUsa: yearsUsa,

        yearsEurope: yearsEurope,

        techspecs: techspecsDataModel

      }
    },

    components: {
      'archive-header': ArchiveHeaderVue
    },

    beforeMount() {
      this.getTechSpecData();
    },

    mounted() {
      globalService.setArchiveDocumentTitle("Tech Specs");
    },

    methods: {

      getTechSpecData: function() {
        var vm = this;

        firebase.database().ref('archive/transformers_usa').once('value').then(function(usa_snapshot) {
          var transformers_usa = usa_snapshot.val();
          var usa_techspecs = _.chain(transformers_usa).where({ hasTechSpec: true }).each(function(ts) {
            ts.region = "USA";
          }).value();

          firebase.database().ref('archive/transformers_europe').once('value').then(function(europe_snapshot) {
            var transformers_europe = europe_snapshot.val();
            var europe_techspecs = _.chain(transformers_europe).where({ hasTechSpec: true }).each(function(ts) {
              ts.region = "Europe";
            }).value();

            firebase.database().ref('archive/action_masters').once('value').then(function(action_masters_snapshot) {
              var action_masters = action_masters_snapshot.val();
              var action_master_techspecs = _.where(action_masters, { hasTechSpec: true });
              _.each(action_master_techspecs, function(ts) {
                ts.year = 'action_masters';
              });

              firebase.database().ref('archive/extra_techspecs').once('value').then(function(extra_techspecs_snapshot) {
                var extra_techspecs = extra_techspecs_snapshot.val();

                var all_techspecs = _.flatten([usa_techspecs, europe_techspecs, action_master_techspecs, extra_techspecs]);
                var mapped_techspecs = _.map(all_techspecs, function(ts) {

                  // interpolate note into name
                  var tsName = ts.name;
                  if (ts.note) {
                    tsName += ' (' + ts.note + ')';
                  }

                  return {
                    name: tsName,
                    faction: ts.faction,
                    year: ts.year,
                    region: ts.region,
                    imgPath: vm.getImagePath(ts)
                  };
                });

                // USA
                _.each(yearsUsa, function(year) {
                  var autobots = _.chain(mapped_techspecs).where({ region: "USA", faction: "Autobot", year: year }).sortBy('name').value();
                  var decepticons = _.chain(mapped_techspecs).where({ region: "USA", faction: "Decepticon", year: year }).sortBy('name').value();

                  _.each(autobots, function(transformer, index) {
                    Vue.set(vm.techspecs.usa.autobots[String(year)], index, autobots[index]);
                  });
                  _.each(decepticons, function(transformer, index) {
                    Vue.set(vm.techspecs.usa.decepticons[String(year)], index, decepticons[index]);
                  });
                });

                // Europe
                _.each(yearsEurope, function(year) {
                  var autobots = _.where(mapped_techspecs, { region: "Europe", faction: "Autobot", year: year });
                  var decepticons = _.where(mapped_techspecs, { region: "Europe", faction: "Decepticon", year: year });

                  _.each(autobots, function(transformer, index) {
                    Vue.set(vm.techspecs.europe.autobots[String(year)], index, autobots[index]);
                  });
                  _.each(decepticons, function(transformer, index) {
                    Vue.set(vm.techspecs.europe.decepticons[String(year)], index, decepticons[index]);
                  });
                });

              });

            });

          });

        });

      },

      getImagePath: function(entry) {
        var imagePath = '/archive/techspecs/';
        imagePath += entry.faction.toLowerCase() + '/';
        if (entry.region === 'Europe') {
          imagePath += 'europe/';
        }
        imagePath += entry.year + '/';
        imagePath += 'ts_' + archiveService.pathWash(entry.name);
        if (entry.note) {
          imagePath += '_(' + archiveService.pathWash(entry.note) + ')';
        }
        imagePath += '.jpg';

        return imagePath;
      },

      getDisplayYear: function(year) {
        if (isNaN(year)) {
          year = archiveService.pathUnwash(year);
        }
        return year;
      }

    }

  };

</script>
