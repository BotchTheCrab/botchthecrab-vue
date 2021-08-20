<style>
  /* */
</style>

<template>

  <div class="container-fluid">

    <archive-header></archive-header>

    <div class="teletranHeader">
  		<span class="teletranHeaderNeutral">Instructions</span>
  	</div>

    <p class="PaperworkCredits">
  		This page offers Instruction scans for all Generation One (G1) Transformers released in America and Europe.<br />
  		Scans from Japan and other lines (G2, Beast Wars, etc) can be found <a href="http://tfwiki.net/~fortmax/" target="fortmax">here</a>.<br />
  		Eternal thanks to <b>James Wilson</b>, the original curator of the Transfomers G1 Instruction Scan Archive.
  	</p>

    <div class="col-sm-6">

      <div class="PaperworkFaction_Autobot">Autobots</div>

      <div class="PaperworkYear" v-for="year in yearsUsa" v-if="instructions.usa.autobots[year].length">
        <div class="PaperworkYearHeader">{{ getDisplayYear(year) }}</div>
        <div class="PaperworkYearContent">
          <div v-for="entry in instructions.usa.autobots[year]">
            <a class="fancybox-button-instructions" rel="fancybox-button" v-bind:title="entry.name + ' - Instructions'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>

    <div class="col-sm-6">

      <div class="PaperworkFaction_Decepticon">Decepticons</div>

      <div class="PaperworkYear" v-for="year in yearsUsa" v-if="instructions.usa.decepticons[year].length">
        <div class="PaperworkYearHeader">{{ getDisplayYear(year) }}</div>
        <div class="PaperworkYearContent">
          <div v-for="entry in instructions.usa.decepticons[year]">
            <a class="fancybox-button-instructions" rel="fancybox-button" v-bind:title="entry.name + ' - Instructions'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>

    <div style="clear:both"><br><br></div>

    <div class="col-sm-6">

			<div class="PaperworkFaction_Autobot">Autobots (European)</div>

      <div class="PaperworkYear" v-for="year in yearsEurope" v-if="instructions.europe.autobots[year].length">
        <div class="PaperworkYearHeader">{{ getDisplayYear(year) }}</div>
        <div class="PaperworkYearContent">
          <div v-for="entry in instructions.europe.autobots[year]">
            <a class="fancybox-button-instructions" rel="fancybox-button" v-bind:title="entry.name + ' - Instructions'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>

    <div class="col-sm-6">

			<div class="PaperworkFaction_Decepticon">Decepticons (European)</div>

      <div class="PaperworkYear" v-for="year in yearsEurope" v-if="instructions.europe.decepticons[year].length">
        <div class="PaperworkYearHeader">{{ getDisplayYear(year) }}</div>
        <div class="PaperworkYearContent">
          <div v-for="entry in instructions.europe.decepticons[year]">
            <a class="fancybox-button-instructions" rel="fancybox-button" v-bind:title="entry.name + ' - Instructions'" v-bind:href="entry.imgPath" target="_blank">{{ entry.name }}</a>
          </div>
        </div>
      </div>

    </div>


    <p style="text-align:center; font-size: 0.9em; padding: 50px 15px; clear: both;">
      <b>Historical contributors to the Instruction Scan Archive:</b> Crazysteve, Devvi, Dr_Nilkog, EwOkSlaYer, Hatch, Hex, Iacon, Jack Lawrence, James Findley, James Wilson, Jarrod Trout, Jason Bell, Jeff Morris, Jeroen Blok, Jim Huey Lee, Kenny McCoy, Kranix2000, Kris Shaw, Matt Anderson, Michael Hofle, Mirage, Napjr, Neil Papworth, Palmeiro, Prime Saber, Primex15, Rapido, Richard C. Mistron, Risk, Rob Rocca, Scott Mangini, Senex Prime, Sonicjay, Steve Taylor, Tec, Tikgnat, Wayne Bickley, William Leijten and Zobovor.
    </p>

  </div>

</template>

<script>

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');

  var yearsUsa = [1984, 1985, 1986, 1987, 1988, 1989, 1990, 'action_masters'];
  var yearsEurope = [1990, 1991, 1992, 1993, 'action_masters'];

  var instructionsDataModel = {
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
    instructionsDataModel.usa.autobots[String(year)] = [];
    instructionsDataModel.usa.decepticons[String(year)] = [];
  });
  _.each(yearsEurope, function(year) {
    instructionsDataModel.europe.autobots[String(year)] = [];
    instructionsDataModel.europe.decepticons[String(year)] = [];
  });

  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {

        yearsUsa: yearsUsa,

        yearsEurope: yearsEurope,

        instructions: instructionsDataModel

      }
    },

    components: {
      'archive-header': ArchiveHeaderVue
    },

    beforeMount() {
      this.getInstructionData();
    },

    mounted() {
      globalService.setArchiveDocumentTitle("Instructions");
    },

    methods: {

      getInstructionData: function() {
        var vm = this;

        var usaRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/transformers_usa').once('value').then(function(usa_snapshot) {
            var transformers_usa = usa_snapshot.val();
            var usa_instructions = _.chain(transformers_usa).where({ hasInstructions: true }).each(function(instr) {
              instr.region = "USA";
            }).value();
            deferred.resolve(usa_instructions);
          });
        }).promise();

        var europeRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/transformers_europe').once('value').then(function(europe_snapshot) {
            var transformers_europe = europe_snapshot.val();
            var europe_instructions = _.chain(transformers_europe).where({ hasInstructions: true }).each(function(instr) {
              instr.region = "Europe";
            }).value();
            deferred.resolve(europe_instructions);
          });
        }).promise();

        var actionMastersRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/action_masters').once('value').then(function(action_masters_snapshot) {
            var action_masters = action_masters_snapshot.val();
            var action_master_instructions = _.where(action_masters, { hasInstructions: true });
            _.each(action_master_instructions, function(instr) {
              instr.year = 'action_masters';
            });
            deferred.resolve(action_master_instructions);
          });
        }).promise();

        var extraRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/extra_instructions').once('value').then(function(extra_instructions_snapshot) {
            var extra_instructions = extra_instructions_snapshot.val();
            deferred.resolve(extra_instructions);
          });
        }).promise();

        $.when(
          usaRequest,
          europeRequest,
          actionMastersRequest,
          extraRequest
        ).done(function(usa_instructions, europe_instructions, action_master_instructions, extra_instructions) {

          var all_instructions = _.flatten([usa_instructions, europe_instructions, action_master_instructions, extra_instructions]);
          var mapped_instructions = _.map(all_instructions, function(instr) {

            // interpolate note into name
            var tsName = instr.name;
            if (instr.note) {
              tsName += ' (' + instr.note + ')';
            }

            return {
              name: tsName,
              faction: instr.faction,
              year: instr.year,
              region: instr.region,
              imgPath: vm.getImagePath(instr)
            };
          });

          // USA
          _.each(yearsUsa, function(year) {
            var autobots = _.chain(mapped_instructions).where({ region: "USA", faction: "Autobot", year: year }).sortBy('name').value();
            var decepticons = _.chain(mapped_instructions).where({ region: "USA", faction: "Decepticon", year: year }).sortBy('name').value();

            _.each(autobots, function(transformer, index) {
              Vue.set(vm.instructions.usa.autobots[String(year)], index, autobots[index]);
            });
            _.each(decepticons, function(transformer, index) {
              Vue.set(vm.instructions.usa.decepticons[String(year)], index, decepticons[index]);
            });
          });

          // Europe
          _.each(yearsEurope, function(year) {
            var autobots = _.where(mapped_instructions, { region: "Europe", faction: "Autobot", year: year });
            var decepticons = _.where(mapped_instructions, { region: "Europe", faction: "Decepticon", year: year });

            _.each(autobots, function(transformer, index) {
              Vue.set(vm.instructions.europe.autobots[String(year)], index, autobots[index]);
            });
            _.each(decepticons, function(transformer, index) {
              Vue.set(vm.instructions.europe.decepticons[String(year)], index, decepticons[index]);
            });
          });

        });

      },

      getImagePath: function(entry) {
        var imagePath = '/archive/instructions/';
        imagePath += entry.faction.toLowerCase() + '/';
        if (entry.region === 'Europe') {
          imagePath += 'europe/';
        }
        imagePath += entry.year + '/';
        imagePath += 'instr_' + archiveService.pathWash(entry.name);
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
