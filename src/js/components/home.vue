<style lang="scss">

  @import "../../sass/_variables.scss";

  #home {

    & > header {
      text-align: center;
      font-style: normal;
      font-size: 3rem;
      margin-bottom: 20px;
      min-height: 4.25rem;
      @media (max-width: $bootstrap-xxs-max) {
        font-size: 2.25rem;
      }
    }

    #home-portal {
      min-height: 300px;
      margin-top: 10px;
      margin-bottom: 50px;

      #home-portal-botch {
        margin-bottom: 20px;
        padding-left: 0;
        @media (max-width: $bootstrap-xxs-max) {
          img {
            height: 175px;
          }
        }
      }

      #home-portal-links {
        padding: 10px 0 40px;
        text-align: left;
        color: #ccc;
        font-size: 1em;
        line-height: 1.8em;

        a.standout {
          font-family: 'Exo 2', Arial, Verdana, sans-serif;
          font-size: 1.3em;
          letter-spacing: 1px;
        }

        div {
          margin-bottom: 25px;
        }
      }

    }

    #home-search-form {
      font-size: 1.2em;

      input[type="text"],
      input[type="search"] {
        width: 200px;
      }
    }

  }

</style>

<template>

  <div id="home" class="container-fluid center-content">

    <header class="btc-header btc-header-autobot"><span class="nowrap">Welcome to</span> <span class="nowrap">Botch's Office...</span></header>

  	<div id="home-portal">
  		<div id="home-portal-botch" class="col-sm-5"><a href="#/about/botch"><img src="/images/botch/botch_mascot_laurent.png" /></a></div>

  		<div id="home-portal-links" class="col-sm-7">
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
  	<div class="page-title" v-show="postings.length">Updates &amp; Blog Posts ...</div>

    <div class="post-blurb" v-for="posting in postings" v-bind:key="posting.postingId" v-bind:post-id="posting.postingId">
      <div class="post-title-full">
        // <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">{{ posting.title }}</router-link>
      </div>

      <div class="post-details">
        <span class="post-timestamp"><label>Posted:</label> {{ formatPosted(posting.posted) }}</span><span class="post-reply-count" v-if="posting.replyCount > 0"><router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId, scrollTo: 'replies' } }">{{ posting.replyCount }} {{ posting.replyCount === 1 ? "Reply" : "Replies" }}</router-link></span>
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
      this.initHome();
    },

    mounted() {
      globalService.setOfficeDocumentTitle();
    },

    methods: {

      initHome: function() {

        var postingsRequest = $.Deferred(function(deferred) {
          blogService.getAllPostings().then(function(postingsSnapshot) {
            deferred.resolve(postingsSnapshot.val());
          });
        }).promise();

        var repliesRequest = $.Deferred(function(deferred) {
          blogService.getAllReplies().then(function(repliesSnapshot) {
            deferred.resolve(repliesSnapshot.val());
          });
        }).promise();

        $.when(postingsRequest, repliesRequest).done(function(postingsResponse, repliesResponse) {
          postingsStore = _.sortBy(postingsResponse, 'posted').reverse();

          repliesStore = _.groupBy(repliesResponse, 'postingId');

          _.each(repliesStore, function(reply, postingId) {
            var matchingPosting = _.findWhere(postingsStore, { postingId: Number(postingId) });
            if (matchingPosting) {
              matchingPosting.replyCount = reply.length;
            }
          });

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

      formatPosted: function(posted) {
        return globalService.formatPosted(posted);
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
