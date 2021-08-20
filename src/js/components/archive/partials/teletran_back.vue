<style>
  /* */
</style>

<template>

  <div id="teletranNext">
    <div id="teletranBack">
      <router-link v-bind:class="backClass" v-bind:to="backLink">Back to {{ backText }} <span v-html="tail" /></router-link>
    </div>
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
        return '/archive/teletran/' + this.faction + '/' + this.year;
      },
      backClass: function() {
        return 'teletranNext' + archiveService.toTitleCase(this.faction);
      }

    }


  };

</script>
