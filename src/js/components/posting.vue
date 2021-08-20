<style>
  /* */
</style>

<template>

  <div class="container-fluid" id="centerContent" v-if="posting.title">

    <botch-watermark></botch-watermark>

    <div class="postTitle">{{ posting.title }}</div>

    <div class="postFullBody" v-html="posting.content"></div>

    <div class="postFooter" v-if="posting.content.length">

    	<div class="postFooterItem">
        <label>Tags:</label>
        <template v-for="(tag, index) in tags">
          <router-link v-bind:to="{ name: 'postings', query: { tagId: tag.tagId } }">{{ tag.text }}</router-link>
          <template v-if="index < tags.length - 1"> &#0149; </template>
        </template>
      </div>

      <div class="postFooterItem">
  			Posted: <span>{{ posting.posted }}</span>
  		</div>

	  </div>

    <div class="adjacentPosts">
      <span v-if="previousPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: previousPosting.postingId } }">&#x25C4; <span>Older</span></router-link>
      </span>
      <span>
        <a v-on:click="scrollTop">&#x25B2; Top</a>
      </span>
      <span v-if="nextPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: nextPosting.postingId } }"><span>Newer</span> &#x25BA;</router-link>
      </span>
    </div>

    <div class="replies" v-if="replies.length">
  		<div class="replyTitle">Comments</div>

      <div class="reply" v-bind:class="reply.isWebmaster ? 'replyWrapperBotch' : ''" v-for="(reply, index) in replies">
        <div class="replyBody" v-html="reply.content"></div>
        <div class="replyFooter">
          &raquo; Posted
          <span class="replyTime">{{ reply.posted }}</span>
          by <b>{{ reply.poster }}</b>
          <span v-if="reply.isWebmaster"> - WEBMASTER</span>
          <span v-if="!reply.isWebmaster && reply.website">[<a v-bind:href="reply.website" target="_blank">website</a>]</span>
        </div>

        <div class="replyDivider" v-if="index < replies.length - 1"></div>
      </div>

    </div>

    <div class="adjacentPosts" v-if="replies.length">
      <span v-if="previousPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: previousPosting.postingId } }">&#x25C4; <span>Older</span></router-link>
      </span>
      <span>
        <a v-on:click="scrollTop">&#x25B2; Top</a>
      </span>
      <span v-if="nextPosting">
        <router-link v-bind:to="{ name: 'posting', params: { postingId: nextPosting.postingId } }"><span>Newer</span> &#x25BA;</router-link>
      </span>
    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  var vm;
  var postingsStore = null;
  var tagsStore = null;
  var repliesStore = null;

  window.tf = archiveService.tf;

  const $openGraphMetaTag = $('meta[property="og:image"]');

  module.exports = {

    data () {
      return {

        posting: {},

        tags: [],

        replies: [],

        previousPosting: null,
        nextPosting: null

      }
    },

    beforeMount() {
      vm = this;
      this.updatePosting();
    },

    beforeDestroy() {
      vm.clearOpenGraphImageMetaTag();
    },

    watch: {
      $route(to, from) {
        this.updatePosting();
      }
    },

    mounted() {
    },

    methods: {

      updatePosting: function() {
        var postingId = Number(this.$route.params.postingId);

        blogService.getAllPostings().then(function(response) {
          postingsStore = response.val();

          vm.posting = _.findWhere(postingsStore, { postingId: postingId });

          vm.updateTitle();
          vm.updateOpenGraphImageMetaTag();

          var postingIndex = _.indexOf(postingsStore, vm.posting);
          postingsStore = _.sortBy(response.val(), 'posted');
          vm.previousPosting = postingIndex > 0 ? postingsStore[postingIndex - 1] : null;
          vm.nextPosting = postingIndex < postingsStore.length - 1 ? postingsStore[postingIndex + 1] : null;

          blogService.getAllTags().then(function(response) {
            tagsStore = response.val();

            vm.tags = _.map(vm.posting.tagIds, function(tagId) {
              return _.findWhere(tagsStore, { tagId: tagId });
            });
          });

          blogService.getAllReplies().then(function(response) {
            repliesStore = response.val();
            vm.replies = _.chain(repliesStore)
              .where({ postingId: vm.posting.postingId })
              .each(function(reply) {
                reply.isWebmaster = reply.email === 'Botch@BotchTheCrab.com';
              })
              .sortBy('posted')
              .value();
          });

        });

      },

      updateTitle: function() {
        globalService.setOfficeDocumentTitle(this.posting.title);
      },

      updateOpenGraphImageMetaTag() {
        if (!$openGraphMetaTag.length) { return; }

        const postingContent = vm.posting.content;
        const imageRegExp = /<img .+?src="(.+?)".*?>/gi;
        const postingImages = vm.posting.content.match(imageRegExp);

        if (postingImages && postingImages.length && postingImages[0]) {
          let imageUrl = postingImages[0].replace(imageRegExp, '$1');
          if (imageUrl.charAt(0) === '/') {
            imageUrl = imageUrl.replace(/Z_(.+?)\.gif/, '$1.jpg');
            imageUrl = location.protocol + '//' + location.host + imageUrl;
          }
          $openGraphMetaTag.attr('content', imageUrl);
        } else {
          vm.clearOpenGraphImageMetaTag();
        }
      },

      clearOpenGraphImageMetaTag: function() {
        $openGraphMetaTag.attr('content', '');
      },

      scrollTop: function() {
        globalService.scrollTop();
      }

    }

  };

</script>
