<style>

  #taglist {
    text-align:		left;
    font-size: 		0.8em;
    line-height: 	150%;

    -moz-column-width: 120px;
    -webkit-column-width: 120px;
    column-width: 120px;

    -moz-column-gap: 15px;
    -webkit-column-gap: 15px;
    column-gap: 15px;

    margin-bottom:	50px;
  }

  #taglist div {
    margin-bottom: 5px;
  }

</style>

<template>

  <div class="container-fluid">

    <div class="pageTitle">Browse Tags</div>

    <div id="taglist">
      <div v-for="tag in tags">
        <router-link v-bind:to="{ name: 'postings', query: { tagId: tag.tagId }}">{{ tag.text }}</router-link>
      </div>
    </div>
  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;

  module.exports = {

    data () {
      return {

        tags: []

      }
    },

    beforeMount() {
      vm = this;
      this.loadTags();
    },

    mounted() {
      globalService.setOfficeDocumentTitle('Browse Tags');
    },

    methods: {

      loadTags: function() {
        blogService.getAllTags().then(function(response) {
          vm.tags = _.sortBy(response.val(), function(tag) {
            return tag.text.toUpperCase();
          });
        });
      }

    }

  };

</script>
