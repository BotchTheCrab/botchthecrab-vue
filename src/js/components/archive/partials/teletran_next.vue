<style>
  /* */
</style>

<template>

  <div id="teletran-next">
    <div id="teletran-continue">
      <router-link v-bind:class="nextClass" v-bind:to="nextLink"><span>Continue to</span> <span>{{ nextText }} <span v-html="tail" /></span></router-link>
    </div>
    <div id="teletran-switch">
      <router-link v-bind:class="switchClass" v-bind:to="switchLink"><span>Switch to</span> <span>{{ switchText }} <span v-html="tail" /></span></router-link>
    </div>
  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  // var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  module.exports = {
    props: ['faction', 'year'],

    data () {
      return {
        tail: "&#133;"
      }
    },

    methods: {

      getParams: function() {

        if (!isNaN(this.year)) {
          this.year = Number(this.year);
        }

    		var switchFaction = this.faction === 'autobot' ? 'decepticon' : 'autobot';
        var switchYear = this.year;

        var nextFaction = null;
        var nextYear = null;

  			switch (this.year) {
  				case 1984:
  				case 1985:
  				case 1986:
  				case 1987:
  				case 1988:
  				case 1989:
  					// go to next year
  					nextFaction = this.faction;
  					nextYear = this.year + 1;
  					break;
  				case 1990:
  					// go to Action Masters
  					nextFaction = this.faction;
  					nextYear = 'action_masters';
  					break;
          case 'action_masters':
            // go to Japan
            nextFaction = this.faction;
  					nextYear = 'japan';
            break;
          case 'japan':
            // go to Europe
            nextFaction = this.faction;
  					nextYear = 'europe';
            break;
          case 'europe':
            // switch sides!
            nextFaction = switchFaction;
  					nextYear = 1984;
            break;
  			}

        return {
          nextFaction: nextFaction,
          nextYear: nextYear,

          switchFaction: switchFaction,
          switchYear: switchYear
        }
      }

    },

    computed: {

      nextText: function() {
        var params = this.getParams();
        var faction = params.nextFaction;
        var year = params.nextYear;

        if (year === 'action_masters') {
          return (faction === 'autobot' ? "Autobot" : "Decepticon") + " Action Masters";
        } else if (year === 'japan') {
          return "Japanese " + (faction === 'autobot' ? "Cybertrons" : "Destrons");
        } else if (year === 'europe') {
          return "European " + (faction === 'autobot' ? "Autobots" : "Decepticons");
        }

        return year + " " + (faction === 'autobot' ? "Autobots" : "Decepticons");
      },
      nextLink: function() {
        var params = this.getParams();
        var faction = params.nextFaction;
        var year = params.nextYear;

        return '/archive/teletran/' + faction + '/' + year;
      },
      nextClass: function() {
        var params = this.getParams();
        var faction = params.nextFaction;

        return 'teletran-next-' + faction;
      },

      switchText: function() {
        var params = this.getParams();
        var faction = params.switchFaction;
        var year = params.switchYear;

        if (year === 'action_masters') {
          return (faction === 'autobot' ? "Autobot" : "Decepticon") + " Action Masters";
        } else if (year === 'japan') {
          return "Japanese " + (faction === 'autobot' ? "Cybertrons" : "Destrons");
        } else if (year === 'europe') {
          return "European " + (faction === 'autobot' ? "Autobots" : "Decepticons");
        }

        return year + " " + (faction === 'autobot' ? "Autobots" : "Decepticons");
      },
      switchLink: function() {
        var params = this.getParams();
        var faction = params.switchFaction;
        var year = params.switchYear;

        return '/archive/teletran/' + faction + '/' + year;
      },
      switchClass: function() {
        var params = this.getParams();
        var faction = params.switchFaction;

        return 'teletran-next-' + faction;
      }

    }

  };

</script>
