<style lang="scss">

  #reinforcements {

    hr {
      margin: 20px auto 35px;
    }

    .archive-paperwork-credits {
      text-align: left;

      b {
        font-size: 120%;
      }
    }

    #Powerdashers, #Bumper, #Kronoform {
      .teletran-icons {
        display: none;
      }
    }

    #Bumper {
      .archive-paperwork-credits {
        margin: 0 0 15px;
      }
    }

    #Kronoform {
      .teletran-name {
        height: 80px;
      }
      .teletran-name-note {
        white-space: normal;
        line-height: 1.2em;
        margin-top: 7px;
      }
    }

  }

</style>

<template>

  <div class="container-fluid" id="reinforcements">

    <archive-header></archive-header>

    <div class="teletran-header">
      <img src="/archive/images/hd_reinforcements.gif" alt="Reinforcements from Cybertron" />
    </div>

    <!-- POWERDASHERS -->
    <p class="archive-paperwork-credits">
      <b>POWERDASHERS!</b>
      <br/>Mail-away Autobots from 1984/5. There were three, and you never knew which one you were going to get. They came in plain boxes and plastic bags, so there was never any official Hasbro box art for them. However, like many other Transformers, they were originally Diaclone toys. The illustrious Scott Gray sent these in: the original Diaclone box art.
    </p>
    <div class="teletran-container" id="Powerdashers">
      <teletran-entry v-for="entry in powerdashers" v-bind:entry="entry"></teletran-entry>
  	</div>

    <hr/>


    <!-- KRONOFORM -->
    <div class="teletran-container" id="Omnibots">
      <p class="archive-paperwork-credits">
        <b>Introducing the OMNIBOTS ...</b>
        <br/>Not actually package art, these images are cobbled together from the promotional advertisements for these 1985 G1 figures that were exclusively available via mail order. But these images are nevertheless requested often, so here you go!
      </p>
      <div class="teletran-container">
        <teletran-entry v-for="entry in omnibots" v-bind:entry="entry"></teletran-entry>
      </div>
    </div>

  	<hr/>


  	<!-- BUMPER -->
  	<div class="teletran-container" id="Bumper">
      <teletran-entry v-bind:entry="bumper"></teletran-entry>

  		<div class="col-lg-10 col-md-10 col-sm-9 col-xs-12">
  			<p class="archive-paperwork-credits"><b>BUMPER</b>, perhaps more commonly known as <b>Bumblejumper</b>, was never officially released in America, but he occasionally showed up packaged on a Bumblebee or Cliffjumper card. He is a completely unique mold similar but not identical to <a href="/archive/teletran/autobot/1984">Bumblebee and Cliffjumper</a>: Bumper resembles a Mazda Familia 1500XG, whereas Bumblebee was a Volkswagen Beetle and Cliffjumper was a Porsche 944. All three figures come from the Microman series, one of the toylines that was a predecessor and contributor to the Transformers line. The names "Bumblejumper" and "Bumper" come from a hybridization by the fans of the names "Bumblebee" and "Cliffjumper", stemming from its appearance on their two cards, and the fact that originally some mistook the toy for a blend and/or recoloring of the two molds. Bumper was only released officially in Brazil (under the name Sedan and in various colors) and that's where this artwork came from.</p>

  			<p class="archive-paperwork-credits">Sources: <a href="http://www.toyarchive.com/Transformers/Brazilian/MiniCars.html">Super Toy Archive</a>; <a href="http://www.geocities.com/transfandomcomic/collection_bumblejumper.html">Planet Sabretron</a>; <a href="http://www.ocf.berkeley.edu/~mingus/tech/bumper.htm">Slim's Custom Transformer Tech Specs</a>.</p>
  		</div>

  	</div>

  	<hr/>


  	<!-- KRONOFORM -->
    <div class="teletran-container" id="Kronoform">
      <p class="archive-paperwork-credits">
        <b>From the KRONOFORM Collection!</b>
        <br/>Transforms from LCD watch to vehicle to robot. I even think I had Kaltor as a kid, when I was too dumb to save the boxes. Oh well.
      </p>
      <div class="teletran-container">
        <teletran-entry v-for="entry in kronoform" v-bind:entry="entry"></teletran-entry>
    	</div>
    </div>

  </div>

</template>

<script>

  // ARCHIVE COMPONENTS
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');
  var TeletranEntryVue = require('components/archive/partials/teletran_entry');

  // TELETRAN (PAGE) COMPONENTS

  var powerdashers = [
    {
      name: "Sky Dasher",
      note: "robot",
      faction: "reinforcements",
      imageName: "Powerdasher_Sky_robot"
    },
    {
      name: "Sky Dasher",
      note: "vehicle",
      faction: "reinforcements",
      imageName: "Powerdasher_Sky_vehicle"
    },
    {
      name: "F-1 Dasher",
      note: "robot",
      faction: "reinforcements",
      imageName: "Powerdasher_F-1_robot"
    },
    {
      name: "F-1 Dasher",
      note: "vehicle",
      faction: "reinforcements",
      imageName: "Powerdasher_F-1_vehicle"
    },
    {
      name: "Drill Dasher",
      note: "robot",
      faction: "reinforcements",
      imageName: "Powerdasher_Drill_robot"
    },
    {
      name: "Drill Dasher",
      note: "vehicle",
      faction: "reinforcements",
      imageName: "Powerdasher_Drill_vehicle"
    }
  ];

  var omnibots = [
    {
      name: "Camshaft",
      faction: "reinforcements",
      hasInstructions: true,
      instructionsPath: null
    },
    {
      name: "Downshift",
      faction: "reinforcements",
      hasInstructions: true,
      instructionsPath: null
    },
    {
      name: "Overdrive",
      faction: "reinforcements",
      hasInstructions: true,
      instructionsPath: null
    },
  ];
  _.each(omnibots, function(omnibot) {
    omnibot.instructionsPath = 'archive/instructions/autobot/1985/instr_' + omnibot.name.toLowerCase() + '.jpg';
  });


  var bumper = {
    name: "Bumper",
    faction: "reinforcements"
  };

  var kronoform = [
    {
      name: "Kaltor",
      note: "Autobot robot & calculator-watch",
      faction: "reinforcements",
      imageName: "kaltor"
    },
    {
      name: "Autoceptor",
      note: "Autobot robot, car & watch",
      faction: "reinforcements",
      imageName: "autoceptor"
    },
    {
      name: "Deceptor",
      note: "Decepticon robot, watch & condor-jet",
      faction: "reinforcements",
      imageName: "deceptor"
    }
  ];

  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {
        powerdashers: powerdashers,
        omnibots: omnibots,
        bumper: bumper,
        kronoform: kronoform
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue,
      'teletran-entry': TeletranEntryVue
    },

    mounted() {
      globalService.setArchiveDocumentTitle("Reinforcements From Cybertron");
    }

  };

</script>
