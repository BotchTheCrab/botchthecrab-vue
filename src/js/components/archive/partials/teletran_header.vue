<style>
  /* */
</style>

<template>

  <div class="teletranHeader">
    <span v-bind:class="headerClass">{{ headerText }}</span>
  </div>

</template>

<script>

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  module.exports = {
    props: ['faction', 'year'],

    computed: {

      headerText: function() {
        var displayFaction = archiveService.toTitleCase(this.faction);
        if (!this.year) {
          // Autobot/Decepticon faction landing page
          return displayFaction + "s";
        }

        if (this.year === 'action_masters') {
          return displayFaction + " Action Masters";
        } else if (this.year === 'japan') {
          return "Japanese " + (this.faction === 'autobot' ? "Cybertrons" : "Destrons");
        } else if (this.year === 'europe') {
          return "European " + displayFaction + "s";
        }
        return this.year + " " + displayFaction + "s";
      },

      headerClass: function() {
        return 'teletranHeader' + archiveService.toTitleCase(this.faction);
      }

    }
  };

</script>
