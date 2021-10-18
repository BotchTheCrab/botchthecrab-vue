<style lang="scss">

  #create-posting {

    .post-title {
      input {
        background: transparent;
        border: transparent;
        font-size: inherit;
        font-family: inherit;
        color: inherit;
      }
    }

    .post-body-full {
      &:not(.editor-loaded) {
        visibility: hidden;
        width: 0;
        height: 0;
        overflow: hidden;
      }
    }

    #create-posting-categories,
    #create-posting-tags {
      min-width: 300px;
    }

    .post-footer-item {
      margin: 20px 0;

      & > label {
        display: inline-block;
        width: 110px;
        text-align: right;
        margin-right: 10px;
      }
    }

  }

  body.tox-fullscreen {
    #menu_trigger_container,
    #footer {
      display: none;
    }
  }

  .select2 {
    margin: 0 !important;

    .select2-selection__rendered,
    .select2-selection__rendered * {
      white-space: normal;
    }

    .select2-selection__choice__display {
      color: black;
    }
  }

  .select2-dropdown.create-posting-select2 {

    .select2-results {
      background-color: black;
      text-align: left;
    }

    .select2-results__option--selected {
      background-color: #666;
    }
  }

  #create-posting-posted {
    font-family: Arial;
    font-weight: normal;
    width: 300px;
    min-height: 32px;
    border: 1px solid #aaa;
    border-radius: 4px;
    padding: 0 5px;
  }

</style>

<template>

  <div class="container-fluid center-content" id="create-posting">

    <botch-watermark></botch-watermark>

    <div class="post-title"><input type="text" v-model="posting.title" placeholder="Post Title Here" /></div>

    <div v-bind:class="{ 'post-body-full': true, 'editor-loaded' : editorLoaded }">
      <textarea id="create-posting-content" v-mode="posting.content" rows="20"></textarea>
    </div>

    <div class="post-footer">

      <div class="post-footer-item">
        <label>Tags:</label>
        <select multiple v-model="posting.tagIds" id="create-posting-tags"></select>
      </div>

      <div class="post-footer-item">
        <label>Categories:</label>
        <select multiple v-model="posting.categoryIds" id="create-posting-categories"></select>
      </div>

      <div class="post-footer-item">
  			<label>Allow Replies:</label>
        <input type="checkbox" v-model="posting.allowReplies" />
  		</div>

      <div class="post-footer-item">
  			<label>Posted:</label>
        <input type="datetime-local" id="create-posting-posted" />
  		</div>

	  </div>

    <button v-on:click="createPosting">Post</button>

  </div>

</template>

<script>
  console.info('createPosting.vue');

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;

  var $head = document.getElementsByTagName('head')[0];


  module.exports = {

    data () {
      return {

        editorLoaded: false,

        posting: {
          postingId: null,
          title: '',
          content: '',
          posted: '',
          allowReplies: true,
          categoryIds: [],
          tagIds: []
        },

        categories: [],

        tags: []

      }
    },

    beforeMount() {
      console.info('beforeMount');
      vm = this;
      this.initContentEditor();
      this.initSelectors();
    },

    mounted() {
      globalService.setOfficeDocumentTitle("Create Posting");
    },

    methods: {

      initContentEditor: function() {
        var s = document.createElement('script');
        var tinymceApiKey = "casdhqgylieh1y3j27nsdxsrpn4f1qtupm3zddbpqzvref26";
        s.src = "https://cdn.tiny.cloud/1/" + tinymceApiKey + "/tinymce/5/tinymce.min.js";
        s.type = "text/javascript";
        s.referrerPolicy = "origin";
        // s.async = false;
        s.onload = function() {
          console.info('tinymce script was loaded');

          vm.tinymce = tinymce;

          console.info({
            tinymce: tinymce
          });

          var tinymceOptions = {
            selector: '#create-posting-content',
            // base_url: '/deploy',

            // content_css : "/css/cassette.css"

            plugins: 'image code lists charmap fullscreen media link',
            // toolbar: 'code',
            // menubar: 'tools',

            toolbar1: 'bold italic underline strikethrough | aligncenter | outdent indent | numlist bullist',
            toolbar2: 'charmap | fullscreen | image media link | code',


            skin: 'oxide-dark',
            content_css: 'dark, /css/cassette.css',
            content_style: 'body { text-align: left; margin: 10px; }'

          };
          console.info({
            tinymceOptions: tinymceOptions
          });

          tinymce.init(tinymceOptions);

          vm.editorLoaded = true;
        };
        $head.appendChild(s);
      },

      initSelectors: function() {
        var k = document.createElement('link');
        k.href = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
        k.rel = "stylesheet";
        $head.appendChild(k);

        var s = document.createElement('script');
        s.src = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";
        s.type = "text/javascript";
        s.onload = function() {
          console.info('select2 script loaded');
        };
        $head.appendChild(s);

        var allCategoriesRequest = vm.getAllCategories().then(function(response) {
          console.info({
            allCategories: response
          });
          var categoryData = _.map(response, function(category) {
            return {
              id: category.categoryId,
              text: category.name
            };
          });
          console.info({
            categoryData: categoryData
          });

          $('#create-posting-categories').select2({
            data: categoryData,
            closeOnSelect: false,
            dropdownCssClass: 'create-posting-select2'
          });
        });

        var allTagsRequest = vm.getAllTags().then(function(response) {
          console.info({
            allTags: response
          });

          var tagData = _.map(response, function(tag) {
            return {
              id: tag.tagId,
              text: tag.text
            };
          });
          tagData = _.sortBy(tagData, 'text');
          console.info({
            tagData: tagData
          });

          $('#create-posting-tags').select2({
            data: tagData,
            closeOnSelect: false,
            dropdownCssClass: 'create-posting-select2'
          });
        });

      },

      getAllCategories: function() {
        return blogService.getAllCategories().then(function(response) {
          return response.val();
        });
      },

      getAllTags: function() {
        return blogService.getAllTags().then(function(response) {
          return response.val();
        });
      },

      getContent: function() {
        console.info('getContent ...');

        vm.posting.content = vm.tinymce.activeEditor.getContent();

        var postTime = $('#create-posting-posted').val();
        if (postTime) {
          vm.posting.posted = postTime.replace('T', ' ') + ':00';
        }

        var tagSelections = $('#create-posting-tags').select2('data');
        vm.posting.tagIds = _.map(tagSelections, function(selection) {
          return Number(selection.id);
        });

        var categorySelections = $('#create-posting-categories').select2('data');
        vm.posting.categoryIds = _.map(categorySelections, function(selection) {
          return Number(selection.id);
        });

        console.info({
          "vm.posting": vm.posting
        });

        return vm.posting;
      },

      createPosting: function() {
        var posting = vm.getContent();

        // if (!posting.title) {
        //   window.alert("Title is missing.");
        //   return;
        // }
        // if (!posting.content) {
        //   window.alert("Content is missing.");
        //   return;
        // }
        // if (!posting.posted) {
        //   window.alert("Posted time is missing.");
        //   return;
        // }

        blogService.getAllPostings().then(function(response) {
          var allPostings = response.val();
          console.info({
            allPostings: allPostings
          });

          var nextEntryIndex = allPostings.length;
          var nextPostingId = _.max(allPostings, 'postingId').postingId + 1;
          console.info({
            nextEntryIndex: nextEntryIndex,
            nextPostingId: nextPostingId
          });

          posting.postingId = nextPostingId;

          console.info('JSON to save and import ...')
          console.info(JSON.parse(JSON.stringify(posting)));
        });

      }

    }

  };

</script>
