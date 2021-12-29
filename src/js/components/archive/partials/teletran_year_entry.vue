<style>
  /* */
</style>

<template>

  <div class="teletran-entry">
    <div class="teletran-box">
      <router-link v-bind:to="desinationLink">
        <img class="teletran-thumbnail" v-bind:src="thumbnailPath" />
      </router-link>
      <div class="teletran-name">
        {{ desinationName }}
      </div>
    </div>
  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  module.exports = {
    props: ['desination'],

    computed: {

      desinationName: function() {
        return this.desination.text || this.desination.year;
      },

      desinationLink: function() {
        return '/archive/teletran/' + this.desination.faction + '/' + this.desination.year;
      },

      thumbnailPath: function() {
        return '/archive/' + this.desination.faction + '/' + this.desination.year + '/Z_' + archiveService.pathWash(this.desination.character) + '.gif';
      }

    }


  };

</script>
