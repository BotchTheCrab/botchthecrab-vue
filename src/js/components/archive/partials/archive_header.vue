<style>
  /* */
</style>

<template>

  <div id="archive-logo">
    <router-link v-bind:to="headerLink"><img src="/archive/images/teletran_logo.gif" alt="Botch's Transformers Box Art Archive" /></router-link>
  </div>

</template>

<script>

  module.exports = {
    computed: {

      headerLink: function() {
        return '/archive';
      }

    }

  };

</script>
