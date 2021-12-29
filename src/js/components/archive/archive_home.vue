<style lang="scss">

  @import "../../../sass/_variables.scss";

  #archive-home-logo {
    margin: 0 auto 25px;
    color: #aaa;
    font-size: 0.8em;
    font-family: Tahoma, Geneva, sans-serif;
    letter-spacing: 0.1em;

    img {
      width: 100%;
      margin-bottom: 5px;
      max-width: 541px;
    }
  }

  #archive-logo {
    margin: 0 auto 10px;

    img {
      width: 100%;
      margin-bottom: 5px;
      max-width: 425px;
    }
  }

  .quicklink-container {
    margin: 0 auto;

    .quicklink {
      margin: 0 auto 30px;

      a {
        font-family: 'Exo 2', Arial, Verdana, sans-serif;
        font-size: 1.0em;
        letter-spacing: 1px;

        img {
          border: 0px;

          &:hover {
            position: relative;
            top: -1px;
            left: -1px;
          }
        }

      }
    }
  }

  #quicklinks-additional {
    @media (min-width: $bootstrap-xs-max) {
      padding-top: 50px;
    }
  }

  #archive-search-form {
    input[type="text"],
    input[type="search"] {
      width: 190px;
      margin: 0 auto 5px;
    }
  }

  #quicklinks-legacy {
    font-size: 0.9rem;

    a:hover {
      text-decoration: none;
    }

    img {
      margin-bottom: 5px;
    }
  }

</style>

<template>

  <div id="archive-home" class="container-fluid center-content">

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
  			<a href="/archive/techspecs"><img src="/archive/images/home/quicklink_techspecs.jpg" alt="Transformers Tech Specs" /></a>
  		</div>
  		<div class="quicklink col-sm-6">
  			<a href="/archive/instructions"><img src="/archive/images/home/quicklink_instructions.gif" alt="Transformers Instructions" /></a>
  		</div>
  	</div>
  	<div class="quicklink-container row text-center">
  		<div class="quicklink col-sm-6">
  			<a href="/archive/catalogs"><img src="/archive/images/home/quicklink_catalogs.jpg" alt="Transformers Catalogs" /></a>
  		</div>
  		<div class="quicklink col-sm-6">
  			<a href="/archive/boxbattles"><img src="/archive/images/home/quicklink_boxbattles.jpg" alt="Transformers Back of the Box Art" /></a>
  		</div>
  	</div>

  	<div class="quicklink-container row text-center">
      <div class="quicklink col-sm-6" id="quicklinks-additional">
        <div><a href="/archive/reinforcements">Reinforcements From Cybertron</a></div>
        <div><a href="/archive/history">Box Art History</a></div>
        <!--<div><a href="/archive/help">Scan / Edit / Donate</a></div>-->
        <div><a href="/contact">FAQ / Contact</a></div>
        <br />
  			<form id="archive-search-form" @submit.prevent="submitSearch">
  				<div>
  					<input type="search" v-model="searchTerm" placeholder="Search the Archive ..." />
  				</div>
  			</form>
  			<div><a href="/tags">Browse Post Tags</a></div>
  		</div>
      <div class="quicklink col-sm-6" id="quicklinks-legacy">
        <a href="https://www.idwpublishing.com/product/5652" target="legacy"><img src="/archive/images/home/tf-legacy.jpg" /><br/><i>Transformers Legacy:<br />The Art of Transformers Packaging</i></a>
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
