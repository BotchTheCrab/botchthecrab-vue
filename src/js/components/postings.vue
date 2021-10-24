<style lang="scss">

  #postings {

    #main-search-form {
      margin-bottom: 30px;

      #main-search-input {
        input, select {
          margin: 0 5px 10px;

          &[type="submit"] {
            width: 100px;
          }
        }
      }
    }

    .teletran-container {
      margin-bottom: 30px;
    }

  }

</style>

<template>

  <div class="container-fluid center-content" id="postings">

    <botch-watermark></botch-watermark>

    <div class="page-title" v-if="pageTitle">{{ pageTitle }}</div>

    <form id="main-search-form" @submit.prevent="submitSearch" v-show="pageTitle">

  		<div id="main-search-input">
  			<input type="search" name="keywords" id="keywords" v-model="query.newSearch" placeholder="Search ..." v-on:click="$event.target.select()" />
        <select v-model="query.newScope">
          <option value="site">Entire Site</option>
          <option value="archive">Box Art Archive</option>
        </select>
  			<input type="submit" value="Search" />
  		</div>

  	</form>


    <!-- ARCHIVE RESULTS -->

    <div class="page-subheader" v-if="query.search">Transformers Box Art Results ...</div>

    <div v-if="!transformersReady">Loading ...</div>

    <div v-if="transformersReady && query.search && transformers.length === 0">No matching Transformers</div>

    <div class="teletran-container teletran-container-search" v-cloak>
      <teletran-entry v-for="entry in transformers" v-bind:entry="entry" v-bind:key="entry.transformerId"></teletran-entry>
      <div class="teletran-load-more" v-if="totalTransformers && transformers.length < totalTransformers" v-on:click="loadAllTransformers">Load All Matching Transformers</div>
    </div>



    <!-- POSTINGS -->

    <div class="page-subheader" v-if="query.search">Postings ...</div>

    <div v-if="!postingsReady">Loading ...</div>

    <div v-if="postingsReady && query.search && postings.length === 0">No matching posts</div>

    <div class="post-blurb" v-for="posting in postings" v-bind:key="posting.postingId" v-bind:post-id="posting.postingId">
      <div class="post-title-full">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">{{ posting.title }}</router-link>
      </div>

      <div class="post-details">
        <span class="post-timestamp"><label>Posted:</label> {{ formatPosted(posting.posted) }}</span><span class="post-reply-count" v-if="posting.replyCount > 0"><router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId, scrollTo: 'replies' } }">{{ posting.replyCount }} {{ posting.replyCount === 1 ? "Reply" : "Replies" }}</router-link></span>
      </div>

      <div class="post-body-full" v-html="posting.blurb"></div>

      <p class="post-body-trimmed" v-if="posting.blurb.length !== posting.content.length">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: posting.postingId } }">Continue &#133;</router-link>
      </p>
    </div>

    <div class="more-posts" v-show="postings.length && postings.length < totalPostings">
      <a v-on:click="loadMorePostings">Load More Posts</a>
    </div>

    <div class="no-more-posts" v-show="postings.length && postings.length === totalPostings">
      No more posts.
    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');
  var TeletranEntryVue = require('components/archive/partials/teletran_entry');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;
  var query = null;

  var transformersStore = null;
  var numTransformersDisplayed = 0;
  var numTransformersPerLoad = 5;

  var postingsStore = null;
  var numPostingsDisplayed = 0;
  var numPostingsPerLoad = 5;

  module.exports = {

    data () {
      return {
        pageTitle: '',
        query: {},

        transformers: [],
        totalTransformers: null,

        postings: [],
        totalPostings: null,

        transformersReady: false,
        postingsReady: false
      }
    },

    components: {
      'teletran-entry': TeletranEntryVue
    },

    watch: {
      $route(to, from) {
        vm.init();
      }
    },

    beforeMount() {
      vm = this;

      vm.init();
    },

    methods: {

      init: function() {
        vm.totalTransformers = null;
        vm.transformersReady = false;
        vm.postingsReady = false;

        vm.parseQuery().then(() => {
          vm.setPageTitle();
          vm.initTransformers();
          vm.initPostings();
        });
      },

      parseQuery: function() {
        vm.query = this.$route.query || {};
        vm.query.search = vm.query.search || '';
        vm.query.scope = vm.query.scope || 'site';

        if (vm.query.tag) {
          return blogService.getAllTags().then(function(response) {
            var tagsStore = response.val();
            var matchingTag = _.findWhere(tagsStore, { text: vm.query.tag });
            vm.query.tagId = matchingTag.tagId;
          });
        }

        vm.query.newSearch = String((vm.query && vm.query.search) || '');
        vm.query.newScope = String((vm.query && vm.query.scope) || 'site');

        return Promise.resolve();
      },

      setPageTitle: function() {
        var tagId = vm.query && vm.query.tagId ? Number(vm.query.tagId) : null;
        var searchTerm = vm.query && vm.query.search ? vm.query.search.toLowerCase() : null;

        if (searchTerm) {
          vm.pageTitle = `Search Results for "${searchTerm}"`;
          globalService.setOfficeDocumentTitle(vm.pageTitle);

        } else if (tagId) {
          blogService.getAllTags().then(function(response) {
            var tagsStore = response.val();
            var matchingTag = _.findWhere(tagsStore, { tagId: tagId });
            if (matchingTag && matchingTag.text) {
              vm.pageTitle = `Posts tagged ${matchingTag.text}`;
              globalService.setOfficeDocumentTitle(vm.pageTitle);
            }
          });

        } else {
          vm.pageTitle = "Adam's Blog and Archive Updates";
          globalService.setOfficeDocumentTitle(vm.pageTitle);
        }

      },

      initTransformers: function() {
        transformersStore = null;
        numTransformersDisplayed = 0;

        vm.transformers = [];

        var searchTerm = (vm.query.search || '').toLowerCase();

        if (!searchTerm) {
          vm.transformersReady = true;
          return;
        }

        var getMatching = function(snapshot) {
          return _.filter(snapshot.val(), transformer => {
            return transformer.name.toLowerCase().indexOf(searchTerm) !== -1;
          });
        }

        var usaRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/transformers_usa').once('value').then(function(usa_snapshot) {
            var matching = getMatching(usa_snapshot);
            deferred.resolve(matching);
          });
        }).promise();

        var micromastersRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/micromasters').once('value').then(function(micromasters_snapshot) {
            var matching = getMatching(micromasters_snapshot);
            deferred.resolve(matching);
          });
        }).promise();

        var actionMastersRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/action_masters').once('value').then(function(action_masters_snapshot) {
            var matching = getMatching(action_masters_snapshot);
            matching = _.where(matching, { region: "USA" });
            deferred.resolve(matching);
          });
        }).promise();

        var europeRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/transformers_europe').once('value').then(function(europe_snapshot) {
            var matching = getMatching(europe_snapshot);
            deferred.resolve(matching);
          });
        }).promise();

        var japanRequest = $.Deferred(function(deferred) {
          firebase.database().ref('archive/transformers_japan').once('value').then(function(japan_snapshot) {
            var matching = getMatching(japan_snapshot);
            deferred.resolve(matching);
          });
        }).promise();

        return $.when(
          usaRequest,
          micromastersRequest,
          actionMastersRequest,
          europeRequest,
          japanRequest
        ).done(function(
          usa_matching,
          micromasters_matching,
          action_masters_matching,
          europe_matching,
          japan_matching
        ) {

          transformersStore = _.flatten([
            usa_matching,
            micromasters_matching,
            action_masters_matching,
            europe_matching,
            japan_matching
          ]);

          vm.totalTransformers = transformersStore.length;

          vm.loadInitialTransformers();

          vm.transformersReady = true;
        });

      },

      loadInitialTransformers: function() {
        var initialTransformersCount = numTransformersPerLoad;
        if (numTransformersDisplayed > numTransformersPerLoad) {
          initialTransformersCount = numTransformersDisplayed;
        }
        var initialTransformers = transformersStore.slice(0, initialTransformersCount);
        _.each(initialTransformers, function(transformer) {
          vm.transformers.push(transformer);
        });
        numTransformersDisplayed = initialTransformersCount;
      },

      loadAllTransformers: function() {
        vm.transformers = transformersStore;
      },

      initPostings: function() {
        postingsStore = null;
        numPostingsDisplayed = 0;

        vm.postings = [];

        var queryKeys = _.keys(vm.query);

        if (vm.query && (vm.query.search || vm.query.tagId)) {

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

            _.each(repliesStore, function(replyStore, postingId) {
              var matchingPosting = _.findWhere(postingsStore, { postingId: Number(postingId) });
              if (matchingPosting) {
                matchingPosting.replyCount = replyStore.length;
              }
            });

            vm.filterPostings();
            vm.loadInitialPostings();

            vm.postingsReady = true;
          });

        } else {

          vm.postingsReady = true;

          window.setTimeout(() => {
            $('#keywords').focus();
          }, 500);
        }

      },

      filterPostings: function() {

        var tagId = vm.query && vm.query.tagId ? Number(vm.query.tagId) : null;
        var searchTerm = (vm.query && vm.query.search) || null;
        var scope = (vm.query && vm.query.scope) || null;

        if (searchTerm) {

          var allMatchingPostings = [];

          if (scope === 'archive') {
            var transformersBoxArtArchiveTagId = 1;

            postingsStore = _.filter(postingsStore, posting => {
              return Array.isArray(posting.tagIds) && posting.tagIds.indexOf(transformersBoxArtArchiveTagId) !== -1;
            });
          }

          let searchTerms = searchTerm.split(' ');

          // filter out indefinite articles
          searchTerms = _.difference(searchTerms, ['a', 'an', 'the', 'to', 'in']);

          _.each(searchTerms, function(searchTerm) {
            var searchRegExp = new RegExp('\\b' + searchTerm + '\\b', 'ig');

            var matchingPostings = _.filter(postingsStore, function(posting) {
              return posting.title.search(searchRegExp) !== -1 ||
                     posting.content.search(searchRegExp) !== -1;
            });


            _.each(matchingPostings, posting => {

              posting.weight = 0;

              if (posting.title.search(searchRegExp) !== -1) {
                posting.weight = 5;
              }

              let searchMatches = posting.content.match(searchRegExp) || [];

              posting.weight += searchMatches.length;

              let existingMatch = _.findWhere(allMatchingPostings, { postingId: posting.postingId });
              if (existingMatch) {
                existingMatch.weight += posting.weight;
              } else {
                allMatchingPostings.push(posting);
              }

            });

          });

          // match full search phrase and assign additional weight
          var fullSearchTermRegExp = new RegExp(searchTerm, 'i');
          _.each(allMatchingPostings, matchingPosting => {
            if (matchingPosting.title.match(fullSearchTermRegExp)) {
              matchingPosting.weight += 50;
            }
            if (matchingPosting.content.match(fullSearchTermRegExp)) {
              matchingPosting.weight += 5;
            }
          });

          postingsStore = _.sortBy(allMatchingPostings, 'weight').reverse();

        } else if (tagId) {

          postingsStore = _.filter(postingsStore, function(posting) {
            return Array.isArray(posting.tagIds) && posting.tagIds.indexOf(tagId) !== -1;
          });

        } else {
          // nothing to show

          postingsStore = [];

        }

        vm.totalPostings = postingsStore.length;
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
            search: vm.query.newSearch,
            scope: vm.query.newScope
          }
        });
      }

    }

  };

</script>
