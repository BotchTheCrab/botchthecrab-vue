<style>
  /* */
</style>

<template>

  <div class="container-fluid" id="centerContent">

    <header id="HomeHeader" class="btc-header btc-header-autobot"><span class="nowrap">Welcome to</span> <span class="nowrap">Botch's Office...</span></header>

  	<div id="HomePortal">
  		<div id="HomePortalBotch" class="col-sm-5"><a href="#/about/botch"><img src="/images/botch/botch_mascot_laurent.png" /></a></div>

  		<div id="HomePortalLinks" class="col-sm-7">
  			<div>
  				<a href="#/archive" class="standout">Botch's Transformers Box Art Archive</a>  &#151; <span class="nowrap">the #1 online destination</span> for G1 Transformers package art since 1998 &#151; is why most humans visit this site.
  			</div>

  			<div>The site's mascot, <a href="#/about/botch" class="standout">Botch the Crab</a>, is the alter-ego of <a href="#/about/adam" class="standout">Adam Alexander</a>, a <a href="/images/about/adam/adam-alexander-resume-2017.pdf" target="resume">front-end web developer</a>, <a href="#/about/music">prog rock musician</a>, and (obviously) a Transformers fan.</div>

  			<div>This site is also <a href="#/postings">Adam's blog</a>. Just scroll down to start reading, or search the entire site below.</div>

  			<form id="home-search-form" @submit.prevent="submitSearch">
  				<div>
  					<input type="search" name="search" v-model="searchTerm" placeholder="Search ..." />
  				</div>
  			</form>

  		</div>
  	</div>


    <!-- BLOG POSTS -->
  	<div class="pageTitle" v-show="postings.length">Updates &amp; Blog Posts ...</div>

    <div class="postBlurb" v-for="posting in postings" v-bind:key="posting.postingId" v-bind:post-id="posting.postingId">
      <div class="postFullTitle">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">{{ posting.title }}</router-link>
      </div>

      <div class="postFullBody" v-html="posting.blurb"></div>

      <p class="postBodyTrim" v-if="posting.blurb.length !== posting.content.length">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">Continue &#133;</router-link>
      </p>
    </div>

    <div class="morePosts" v-show="postings.length">
      <a v-on:click="loadMorePostings">Load More Posts</a>
  	</div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;
  var postingsStore = null;
  var numPostingsDisplayed = 0;
  var numPostingsPerLoad = 5;

  module.exports = {

    data() {
      return {

        postings: []

      }
    },

    beforeMount() {
      vm = this;
      this.getPostingsStore();
    },

    mounted() {
      globalService.setOfficeDocumentTitle();
    },

    methods: {

      getPostingsStore: function() {
        blogService.getAllPostings().then(function(response) {
          postingsStore = _.sortBy(response.val(), 'posted').reverse();
          vm.loadInitialPostings();
        });
      },

      loadInitialPostings: function() {
        var initialPostingsCount = numPostingsPerLoad;
        if (numPostingsDisplayed > numPostingsPerLoad) {
          initialPostingsCount = numPostingsDisplayed;
        }

        var initialPostings = postingsStore.slice(0, initialPostingsCount);
        initialPostings = blogService.setPostingBlurbs(initialPostings);
        _.each(initialPostings, function(posting) {
          vm.postings.push(posting);
        });
        numPostingsDisplayed = initialPostingsCount;
      },

      loadMorePostings: function() {
        var newPostingTally = numPostingsDisplayed + numPostingsPerLoad;

        var morePostings = postingsStore.slice(numPostingsDisplayed, newPostingTally);
        morePostings = blogService.setPostingBlurbs(morePostings);
        _.each(morePostings, function(posting) {
          vm.postings.push(posting);
        });
        numPostingsDisplayed = newPostingTally;
      },

      submitSearch: function() {
        this.$router.push({
          path: '/postings',
          query: {
            search: this.searchTerm
          }
        });
      }

    }

  };

</script>
