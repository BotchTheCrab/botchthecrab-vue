<style lang="scss">

  @import "../../sass/_variables.scss";

  #gallery-entry {

    #gallery-entry-name {
    	font-family: Audiowide, Arial, Verdana, sans-serif;
    	font-size: 2em;
    	letter-spacing: 1px;
    	font-weight: bold;

    	padding: 5px 15px;
    	text-align: center;
    }

    #gallery-entry-container {
    	text-align: center;
    	margin-top: 5px;
    	margin-bottom: 15px;
    	position: relative;

      /*
      	Only display next/prev when mouse-hovering over the parent.
      	In a touch interface, no mouse-hover will be detected, so the
      	full fancybox outer area can be swiped!
      */
      .prevLink,
      .nextLink {
      	display: none;
      }
      &:hover .prevLink,
      &:hover .nextLink {
      	display: block;
      }

      .prevLink a,
      .nextLink a {
      	position: absolute;
      	width: 5%;
      	min-width: 50px;
      	height: 100%;
      }
      .prevLink a {
      	left: 0px;
      	text-align: left;
      	padding-left: 10px;
      }
      .nextLink a {
      	right: 0px;
      	text-align: right;
      	padding-right: 10px;
      }
      .prevLink img,
      .nextLink img {
      	/* display: none; */
      	position: relative;
      	top: 40%;
      	width: 36px;
      	height: 34px;
      	background-image: url(/fancybox/source/fancybox_sprite.png);
      	opacity: 0.3;
      }
      @media (max-width: $bootstrap-xs-max) {
      	.prevLink img,
      	.nextLink img {
      		top: 70%;
      		opacity: 0.6;
      	}
      }

      .prevLink:hover img,
      .nextLink:hover img {
      	display: inline;
      	opacity: 1;
      }
      .prevLink img {
      	background-position: 0px -36px;
      }
      .nextLink img {
      	background-position: 0px -72px;
      }

    }

    #gallery-entry-image {
    	border: 2px solid BLACK;
    	max-width: 88%;
    	max-height: 600px;
    }

    #gallery-entry-desc {
    	width: 90%;
    	background-color: #444;
    	box-shadow: 2px 2px 3px #333;
    	font-size: 1em;

    	border-radius: 8px 8px 0 0;

    	margin: 0 auto 10px;
    	max-width: 600px;
    	font-size: 1em;
    	text-align: left;
    	color: #eee;
    	padding: 10px;

    	&.gallery-entry-desc-short {
    		text-align: center;
    	}
    }

    .adjacent-posts {
    	max-width: 600px;
    }
  }

</style>

<template>

  <div class="container-fluid" id="gallery-entry">

    <botch-watermark></botch-watermark>

    <div class="page-title" v-if="gallery.name">
      <router-link v-bind:to="{ name: 'gallery', params: { galleryId: gallery.galleryId } }">
        {{ gallery.name }}
      </router-link>
    </div>

    <div id="gallery-entry-name" v-if="gallery.name && galleryEntry.name" v-html="galleryEntry.name"></div>

    <div id="gallery-entry-container" v-if="galleryEntry.imageName">
      <div class="prevLink" v-if="previousEntryId">
        <router-link v-bind:to="{ name: 'galleryEntry', params: { galleryEntryId: previousEntryId } }">
          <img src="/images/_.gif" />
        </router-link>
      </div>
      <div class="nextLink" v-if="nextEntryId">
        <router-link v-if="nextEntryId" v-bind:to="{ name: 'galleryEntry', params: { galleryEntryId: nextEntryId } }">
          <img src="/images/_.gif" />
        </router-link>
      </div>

  		<a v-bind:href="'/gallery/' +  galleryEntry.imageName" target="galleryEntry"><img id="gallery-entry-image" v-bind:src="'/gallery/' +  galleryEntry.imageName"></a>
  	</div>

  	<div id="gallery-entry-desc" v-bind:class="{ 'gallery-entry-desc-short' : galleryEntry.description.length < 60 }" v-html="galleryEntry.description"></div>

   	<div class="adjacent-posts">
  		<span>
        <router-link v-if="previousEntryId" v-bind:to="{ name: 'galleryEntry', params: { galleryEntryId: previousEntryId } }">
          &#x25C4; <span>PREVIOUS</span>
        </router-link>
      </span>
  		<span>
        <router-link v-bind:to="{ name: 'gallery', params: { galleryId: gallery.galleryId } }">
          [ Gallery ]
        </router-link>
      </span>
  		<span>
        <router-link v-if="nextEntryId" v-bind:to="{ name: 'galleryEntry', params: { galleryEntryId: nextEntryId } }">
          <span>NEXT</span> &#x25BA;
        </router-link>
      </span>
  	</div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  var vm;

  module.exports = {

    data () {
      return {
        gallery: {},
        galleryEntry: {},
        previousEntryId: null,
        nextEntryId: null
      }
    },

    watch: {
      $route(to, from) {
        vm.getGalleryEntryData();
      }
    },

    beforeMount() {
      vm = this;
      vm.getGalleryEntryData();
    },

    methods: {

      getGalleryEntryData: function() {

        var galleryEntryId = Number(this.$route.params.galleryEntryId);

        firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
          let galleryEntries = entriesSnapshot.val();

          vm.galleryEntry = _.findWhere(galleryEntries, { entryId: galleryEntryId });

          firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
            var galleries = galleriesSnapshot.val();

            vm.gallery = _.findWhere(galleries, { galleryId: vm.galleryEntry.galleryId });

            globalService.setOfficeDocumentTitle(vm.gallery.name + " - " + vm.galleryEntry.name);

            galleryEntries = _.where(galleryEntries, { galleryId: vm.gallery.galleryId });
            switch (vm.gallery.sort) {
              case 'Name':
                galleryEntries = _.sortBy(galleryEntries, 'name');
                break;
              case 'Date Ascending':
                galleryEntries = _.sortBy(galleryEntries, 'entryId');
                break;
              case 'Date Descending':
                galleryEntries = _.sortBy(galleryEntries, 'entryId').reverse();
                break;
              default:
                galleryEntries = _.sortBy(galleryEntries, 'entryId');
            }

            const galleryEntryIndex = _.indexOf(galleryEntries, vm.galleryEntry);

            vm.previousEntryId = galleryEntryIndex > 0 ? galleryEntries[galleryEntryIndex - 1].entryId : null;
            vm.nextEntryId = galleryEntryIndex < galleryEntries.length - 1 ? galleryEntries[galleryEntryIndex + 1].entryId : null;
          });

        });

      }

    }


  };

</script>
