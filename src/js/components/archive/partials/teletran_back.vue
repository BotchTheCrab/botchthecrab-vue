<style>
  /* */
</style>

<template>

  <div id="teletran-back">
    <router-link v-bind:class="backClass" v-bind:to="backLink"><span>Back to</span> {{ backText }} <span v-html="tail" /></router-link>
  </div>

</template>

<script>

  var archiveService = require('services/archive_service');

  module.exports = {
    props: ['faction', 'year'],

    data () {
      return {
        tail: "&#133;"
      }
    },

    computed: {

      backText: function() {
        return this.year + ' ' + archiveService.toTitleCase(this.faction)+'s';
      },
      backLink: function() {
        return '/archive/teletran/' + this.faction.toLowerCase() + '/' + this.year;
      },
      backClass: function() {
        return 'teletran-next-' + this.faction.toLowerCase();
      }

    }


  };

</script>
