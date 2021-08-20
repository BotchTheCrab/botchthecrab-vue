<style>
</style>

<template>

  <div class="container-fluid" id="galleryEntry">

    <botch-watermark></botch-watermark>


    <div class="pageTitle" v-if="gallery.name">
      <router-link v-bind:to="{ name: 'gallery', params: { galleryId: gallery.galleryId } }">
        {{ gallery.name }}
      </router-link>
    </div>

    <div id="galleryEntryName" v-if="gallery.name && galleryEntry.name" v-html="galleryEntry.name"></div>

    <div id="galleryEntryContainer" v-if="galleryEntry.imageName">
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

  		<a v-bind:href="'/gallery/' +  galleryEntry.imageName" target="galleryEntry"><img id="galleryEntryDisplay" v-bind:src="'/gallery/' +  galleryEntry.imageName"></a>
  	</div>

  	<div class="galleryEntryDesc" v-bind:class="{ 'galleryEntryDescShort' : galleryEntry.description.length < 60 }" v-html="galleryEntry.description"></div>

   	<div class="adjacentPosts">
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

    mounted() {
      // globalService.setOfficeDocumentTitle("More Galleries");
    },

    methods: {

      getGalleryEntryData: function() {
        console.info('getGalleryEntryData ...');

        // var vm = this;

        var galleryEntryId = Number(this.$route.params.galleryEntryId);
        console.info({
          galleryEntryId
        });

        firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
          let galleryEntries = entriesSnapshot.val();
          console.info({
            galleryEntries
          });

          vm.galleryEntry = _.findWhere(galleryEntries, { entryId: galleryEntryId });
          console.info({
            "vm.galleryEntry": vm.galleryEntry
          });

          firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
            var galleries = galleriesSnapshot.val();
            console.info({
              galleries
            });

            vm.gallery = _.findWhere(galleries, { galleryId: vm.galleryEntry.galleryId });
            console.info({
              "vm.gallery": vm.gallery
            });

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
            console.info({
              galleryEntryIndex
            });

            vm.previousEntryId = galleryEntryIndex > 0 ? galleryEntries[galleryEntryIndex - 1].entryId : null;
            vm.nextEntryId = galleryEntryIndex < galleryEntries.length - 1 ? galleryEntries[galleryEntryIndex + 1].entryId : null;
            console.info({
              "vm.previousEntryId": vm.previousEntryId,
              "vm.nextEntryId": vm.nextEntryId
            });

          });

        });

      // },
      //
      // getThumbnailPath: function(entry) {
      //   return '/gallery/Z_' + entry.imageName.replace(/&/, '_');
      }

    }


  };

</script>
