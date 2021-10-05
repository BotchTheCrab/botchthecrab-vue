<style>
  /* */
</style>

<template>

  <div class="container-fluid center-content">

    <botch-watermark></botch-watermark>

    <!-- Archive Large Logo -->
  	<div id="archive-home-logo" class="text-center">
  		<img src="/archive/images/home/archive_logo_2014.jpg" alt="Botch's Transformers Box Art Archive" />
  		<div>Generation One Transformers Box Art, Instructions, Tech Specs and much more&#133;</div>
  	</div>

  	<!-- Quick Links -->
  	<div class="quicklink-container row text-center">
  		<div class="quicklink col-sm-6">
  			<router-link v-bind:to="'/archive/teletran/autobot'">
  				<img src="/archive/images/home/quicklink_autobots_optimus_prime.jpg" alt="Autobot Box Art" />
  			</router-link>
  		</div>
  		<div class="quicklink col-sm-6">
  			<router-link v-bind:to="'/archive/teletran/decepticon'">
  				<img src="/archive/images/home/quicklink_decepticons_megatron.jpg" alt="Decepticon Box Art" />
  			</router-link>
  		</div>
  	</div>

  	<hr style="margin: 10px auto 40px" />

  	<div class="quicklink-container row text-center">
  		<div class="quicklink col-sm-6">
  			<a href="#/archive/techspecs"><img src="/archive/images/home/quicklink_techspecs.jpg" alt="Transformers Tech Specs" /></a>
  		</div>
  		<div class="quicklink col-sm-6">
  			<a href="#/archive/instructions"><img src="/archive/images/home/quicklink_instructions.gif" alt="Transformers Instructions" /></a>
  		</div>
  	</div>
  	<div class="quicklink-container row text-center">
  		<div class="quicklink col-sm-6">
  			<a href="#/archive/catalogs"><img src="/archive/images/home/quicklink_catalogs.jpg" alt="Transformers Catalogs" /></a>
  		</div>
  		<div class="quicklink col-sm-6">
  			<a href="#/archive/boxbattles"><img src="/archive/images/home/quicklink_boxbattles.jpg" alt="Transformers Back of the Box Art" /></a>
  		</div>
  	</div>

  	<div class="quicklink-container row text-center">
  		<div class="quicklink col-sm-6">
  			<form id="archive-search-form" @submit.prevent="submitSearch">
  				<div>
  					<input type="search" v-model="searchTerm" placeholder="Search the Archive ..." />
  				</div>
  			</form>
  			<div><a href="#/tags">Browse Post Tags</a></div>
  		</div>
  		<div class="quicklink col-sm-6">
  			<div><a href="#/archive/reinforcements">Reinforcements From Cybertron</a></div>
  			<div><a href="#/archive/history">Box Art History</a></div>
  			<!--<div><a href="#/archive/help">Scan / Edit / Donate</a></div>-->
  			<div><a href="#/contact">Contact</a></div>
  		</div>
  	</div>


    <!-- BLOG POSTS -->
  	<div class="page-title" v-show="postings.length">Updates &amp; Blog Posts ...</div>

    <div class="post-blurb" v-for="posting in postings" v-bind:key="posting.postingId" v-bind:post-id="posting.postingId">
      <div class="post-title-full">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">{{ posting.title }}</router-link>
      </div>

      <div class="post-body-full" v-html="posting.blurb"></div>

      <p class="post-body-trimmed" v-if="posting.blurb.length !== posting.content.length">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">Continue &#133;</router-link>
      </p>
    </div>

    <div class="more-posts" v-show="postings.length">
      <a v-on:click="loadMorePostings">Load More Posts</a>
  	</div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');
  var botchWatermarkVue = require('components/partials/botch_watermark');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;
  var postingsStore = null;
  var numPostingsDisplayed = 0;
  var numPostingsPerLoad = 5;

  module.exports = {

    components: {
      'botch-watermark': botchWatermarkVue
    },

    data () {
      return {

        postings: []

      }
    },

    beforeMount() {
      vm = this;
      this.getPostingsStore();
    },

    mounted() {
      globalService.setArchiveDocumentTitle();
    },

    methods: {

      getPostingsStore: function() {
        blogService.getAllPostings().then(function(response) {
          postingsStore = _.chain(response.val()).filter(function(posting) {
            return posting.categoryIds.indexOf(2) !== -1;
          }).sortBy(response.val(), 'posted').reverse().value();
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
            search: this.searchTerm,
            scope: 'archive'
          }
        });
      }

    }


  };

</script>
