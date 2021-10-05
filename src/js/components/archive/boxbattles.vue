<style lang="scss">

  #boxbattles {

    .teletran-name {
      height: 80px;
    }
    .teletran-name-note {
      margin-top: 0.5em;
      white-space: normal;
    }

  }

</style>

<template>

  <div class="container-fluid" id="boxbattles">

    <archive-header></archive-header>

    <div class="teletran-header">
  		<span class="teletran-header-neutral">Back of the Box Art</span>
  	</div>

    <div class="gallery-description">
      <p>Due to popular demand, Botch's Transformers Box Art Archive presents what you saw when you flipped your box over and looked just above the tech spec: presenting the Back of the Box Art gallery. Of course, why there were multiples of each character, we never knew.</p>
      <p>If you think my years are wrong (and can show me why), please let me know. If you have one of the missing scans, or a better version of one I have here, please send it to <a href="mailto:Botch@BotchTheCrab.com">Botch@BotchTheCrab.com</a>.</p>
    </div>

    <div id="teletran-container" v-cloak>

      <div class="teletran-entry" v-for="battle in boxbattles">
        <div class="teletran-box">
          <a class="fancybox-button-art" rel="fancybox-button" v-bind:title="battle.displayTitle" v-bind:href="battle.imagePath" target="_blank">
            <img class="teletran-thumbnail" v-bind:src="battle.thumbnailPath" v-bind:title="battle.displayName" />
          </a>
          <div class="teletran-name">
            {{ battle.displayName }}
            <div class="teletran-name-note" v-if="battle.description">{{ battle.description }}</div>
          </div>
        </div>
      </div>

    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');

  module.exports = {

    data () {
      return {
        boxbattles: []
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue
    },

    beforeMount() {
      this.getBoxBattleData();
    },

    mounted() {
      globalService.setArchiveDocumentTitle("Back of the Box Art");
    },

    methods: {

      getBoxBattleData: function() {
        var vm = this;

        firebase.database().ref('archive/boxbattles').once('value').then(function(snapshot) {
          var boxbattles = snapshot.val();

          _.each(boxbattles, function(battle) {
            battle.displayName = vm.getDisplayName(battle);
            battle.displayTitle = vm.getDisplayTitle(battle);
            battle.thumbnailPath = vm.getThumbnailPath(battle);
            battle.imagePath = vm.getImagePath(battle);
          });

          vm.boxbattles = boxbattles;
        });

      },

      getDisplayName: function(entry) {
        var displayName = entry.year;
        if (entry.region !== "USA") {
          displayName += " (" + entry.region + ")";
        }
        return displayName;
      },

      getDisplayTitle: function(entry) {
        var displayTitle = this.getDisplayName(entry);
        if (entry.description) {
          displayTitle += " - " + entry.description;
        }
        return displayTitle;
      },

      getImageName: function(entry) {
        var imageName = 'box_battle_';
        imageName += (entry.year - 1900);
        if (entry.region === 'Europe') {
          imageName += '_eu';
        }
        if (entry.region === 'Japan') {
          imageName += '_japan';
        }
        if (entry.imageId) {
          imageName += '_' + entry.imageId;
        }
        imageName += '.jpg';

        return imageName;
      },

      getThumbnailPath: function(entry) {
        return '/archive/boxbattles/Z_' + this.getImageName(entry);
      },

      getImagePath: function(entry) {
        return '/archive/boxbattles/' + this.getImageName(entry);
      }

    }


  };

</script>
