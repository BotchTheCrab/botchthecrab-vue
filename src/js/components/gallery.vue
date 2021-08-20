<style>
</style>

<template>

  <div class="container-fluid" id="gallery">

    <botch-watermark></botch-watermark>

    <div class="pageTitle">{{ gallery.name }}</div>

    <div class="galleryDescription" v-html="gallery.description"></div>

    <div id="teletranContainer" v-cloak>

      <div class="teletranEntry" v-for="galleryEntry in galleryEntries">
        <div class="teletranBox">
          <router-link v-bind:to="{ name: 'galleryEntry', params: { galleryEntryId: galleryEntry.entryId } }">
            <img class="teletranThumb" v-bind:src="galleryEntry.thumbnailPath" />
          </router-link>
          <div class="teletranName" v-html="galleryEntry.name"></div>
        </div>
      </div>

    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {
        gallery: {},
        galleryEntries: []
      }
    },

    beforeMount() {
      this.getGalleryData();
    },

    methods: {

      getGalleryData: function() {
        var vm = this;

        var galleryId = Number(this.$route.params.galleryId);

        firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
          var galleries = galleriesSnapshot.val();
          console.info({
            galleries
          });

          vm.gallery = _.findWhere(galleries, { galleryId: galleryId });
          console.info({
            "vm.gallery": vm.gallery
          });

          globalService.setOfficeDocumentTitle(vm.gallery.name);

          firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
            var galleryEntries = entriesSnapshot.val();
            console.info({
              galleryEntries
            });

            let matchingEntries = _.where(galleryEntries, { galleryId: vm.gallery.galleryId });
            switch (vm.gallery.sort) {
              case 'Name':
                matchingEntries = _.sortBy(matchingEntries, 'name');
                break;
              case 'Date Ascending':
                matchingEntries = _.sortBy(matchingEntries, 'entryId');
                break;
              case 'Date Descending':
                matchingEntries = _.sortBy(matchingEntries, 'entryId').reverse();
                break;
              default:
                matchingEntries = _.sortBy(matchingEntries, 'entryId');
            }

            console.info({
              matchingEntries
            });

            _.each(matchingEntries, galleryEntry => {
              galleryEntry.thumbnailPath = vm.getThumbnailPath(galleryEntry);
            })

            vm.galleryEntries = matchingEntries;
            console.info({
              "vm.galleryEntries": vm.galleryEntries
            });
          });

        });

      },

      getThumbnailPath: function(entry) {
        return '/gallery/Z_' + entry.imageName.replace(/&/, '_');
      }

    }


  };

</script>
