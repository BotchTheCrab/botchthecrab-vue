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
        width: 120px;
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
      <textarea id="create-posting-content" v-model="posting.content" rows="20"></textarea>
    </div>

    <div class="post-footer" v-bind:style="{ visibility: (editorLoaded ? 'visible' : 'hidden') }">

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
        <input type="datetime-local" id="create-posting-posted" v-model="posting.posted" />
  		</div>

	  </div>

    <!-- <button v-on:click="createPosting">Post</button> -->
    <button v-if="!posting.postingId" v-on:click="createPosting">Create Post</button>
    <button v-if="posting.postingId" v-on:click="updatePosting">Update Post</button>
    <button v-if="posting.postingId" v-on:click="deletePosting">Delete Post</button>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;

  let postingId;
  let postingsStore;
  var $head = document.getElementsByTagName('head')[0];

  function sortBySelectionOrder(event) {
    var element = event.params.data.element;
    var $element = $(element);

    $element.detach();
    $(this).append($element);
    $(this).trigger("change");

    // clear text search field
    $('.select2-search__field').val('');

    const content = vm.getContent();
  }


  module.exports = {

    data() {
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
      vm = this;
      vm.initAuthorization();
    },

    mounted() {
      globalService.setOfficeDocumentTitle("Create Posting");
    },

    methods: {

      initAuthorization() {
        blogService.initAuthorization(vm);
      },

      init() {
        postingId = Number(this.$route.params.postingId);

        if (postingId) {
          // EDIT MODE
          globalService.setOfficeDocumentTitle("Edit Posting");

          blogService.getAllPostings().then(function(allPostings) {
            postingsStore = allPostings;

            let posting = _.findWhere(postingsStore, { postingId: postingId });
            posting.content = blogService.parsePostingImageUrlsIntoFirebaseUrls(posting.content);
            vm.posting = posting;

            vm.initEditor();
          });

        } else {
          // CREATE MODE
          globalService.setOfficeDocumentTitle("Create Posting");

          vm.initEditor();
        }

      },

      initEditor() {
        vm.initContentEditor();
        vm.initSelectors();
      },

      initContentEditor() {
        blogService.initContentEditor(vm);
      },

      initSelectors() {
        var k = document.createElement('link');
        k.href = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
        k.rel = "stylesheet";
        $head.appendChild(k);

        var s = document.createElement('script');
        s.src = "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";
        s.type = "text/javascript";
        s.onload = function() {

          var allCategoriesRequest = vm.getAllCategories().then(function(allCategories) {
            var categoryData = _.map(allCategories, function(category) {
              return {
                id: category.categoryId,
                text: category.name
              };
            });

            if (Array.isArray(vm.posting.categoryIds)) {
              _.each(categoryData, category => {
                if (vm.posting.categoryIds.includes(category.id)) {
                  category.selected = true;
                }
              });
            }

            $('#create-posting-categories').select2({
              data: categoryData,
              closeOnSelect: false,
              dropdownCssClass: 'create-posting-select2'
            }).on('select2:select', sortBySelectionOrder);
          });

          var allTagsRequest = vm.getAllTags().then(function(response) {
            var tagData = _.map(response, function(tag) {
              return {
                id: tag.tagId,
                text: tag.text
              };
            });
            tagData = _.sortBy(tagData, 'text');

            if (Array.isArray(vm.posting.tagIds)) {
              _.each(tagData, tag => {
                if (vm.posting.tagIds.includes(tag.id)) {
                  tag.selected = true;
                }
              });
            }

            $('#create-posting-tags').select2({
              data: tagData,
              closeOnSelect: false,
              dropdownCssClass: 'create-posting-select2'
            }).on('select2:select', sortBySelectionOrder);
          });

        };

        $head.appendChild(s);
      },

      getAllCategories() {
        return blogService.getAllCategories().then(function(allCategories) {
          return allCategories;
        });
      },

      getAllTags() {
        return blogService.getAllTags().then(function(allTags) {
          return allTags;
        });
      },

      getContent() {
        vm.posting.content = vm.tinymce.activeEditor.getContent().replace('\n', '').replace(/\n/g, '');

        var postTime = $('#create-posting-posted').val();
        if (postTime) {
          vm.posting.posted = (postTime.replace('T', ' ') + ':00').substring(0,19);
        }

        var tagSelections = $('#create-posting-tags').select2('data');
        vm.posting.tagIds = _.map(tagSelections, function(selection) {
          return Number(selection.id);
        });

        var categorySelections = $('#create-posting-categories').select2('data');
        vm.posting.categoryIds = _.map(categorySelections, function(selection) {
          return Number(selection.id);
        });

        return vm.posting;
      },

      validatePosting(posting) {
        if (!posting.title) {
          window.alert("Title is missing.");
          return false;
        }
        if (!posting.content) {
          window.alert("Content is missing.");
          return false;
        }
        if (!posting.tagIds.length) {
          window.alert("Tags are missing.");
          return false;
        }
        if (!posting.categoryIds.length) {
          window.alert("Categories are missing.");
          return false;
        }
        if (!posting.posted) {
          window.alert("Posted time is missing.");
          return false;
        }

        return true;
      },

      createPosting() {
        var posting = vm.getContent();
        if (!vm.validatePosting(posting)) {
          return;
        }

        blogService.getAllPostings().then(function(allPostings) {
          var nextEntryIndex = allPostings.length;
          var nextPostingId = _.max(allPostings, 'postingId').postingId + 1;
          posting.postingId = nextPostingId;

          var postingUpdate = {};
          postingUpdate['blog/postings/' + nextEntryIndex] = posting;

          return firebase.database().ref().update(postingUpdate).then(function(response) {
            window.alert("Your posting was successfully submitted!");

            // refresh postings and redirect to home page
            blogService.getAllPostings(true).then(function() {
              vm.$router.push({
                path: '/posting/' + nextPostingId
              });
            });

          }, function(error) {
            console.error(error);
            window.alert("There was an error attempting to submit your posting.");
          });

        });

      },

      updatePosting() {
        let posting = vm.getContent();

        if (!vm.validatePosting(posting)) {
          return;
        }

        posting.content = blogService.parseFirebaseUrlsIntoPostingImageUrls(posting.content);

        blogService.getAllPostings().then(function(allPostings) {
          let postingUpdate = {};
          // posting DB index does not match postingId
          var dbPostIndex = _.findIndex(allPostings, { postingId: posting.postingId });
          postingUpdate['blog/postings/' + dbPostIndex] = posting;

          return firebase.database().ref().update(postingUpdate).then(function(response) {
            window.alert("Your posting was successfully updated!");

            // refresh postings and redirect post page
            blogService.getAllPostings(true).then(function() {
              vm.$router.push({
                path: '/posting/' + posting.postingId
              });
            });

          }, function(error) {
            console.error(error);
            window.alert("There was an error attempting to update your posting.");
          });
        });
      },

      deletePosting() {
        blogService.getAllPostings().then(function(allPostings) {
          let postingRemove = {};
          // posting DB index does not match postingId
          var dbPostIndex = _.findIndex(allPostings, { postingId: vm.posting.postingId });
          postingRemove['blog/postings/' + dbPostIndex] = null;

          return firebase.database().ref().update(postingRemove).then(function(response) {
            window.alert("Your posting was successfully deleted!");

            // refresh postings and redirect post page
            blogService.getAllPostings(true).then(function() {
              vm.$router.push({
                path: '/'
              });
            });

          }, function(error) {
            console.error(error);
            window.alert("There was an error attempting to delete your posting.");
          });
        });
      }

    }

  };

</script>
