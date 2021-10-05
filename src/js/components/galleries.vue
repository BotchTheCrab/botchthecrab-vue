<style>
</style>

<template>

  <div class="container-fluid" id="galleries">

    <botch-watermark></botch-watermark>

    <div class="page-title">More Galleries</div>

    <div id="teletran-container" v-cloak>

      <div class="teletran-entry" v-for="gallery in galleries">
        <div class="teletran-box">
          <router-link v-bind:to="{ name: 'gallery', params: { galleryId: gallery.galleryId } }">
            <img class="teletran-thumbnail" v-bind:src="gallery.thumbnailPath" />
          </router-link>
          <div class="teletran-name">{{ gallery.name }}</div>
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
        galleries: []
      }
    },

    beforeMount() {
      this.getGalleriesData();
    },

    mounted() {
      globalService.setOfficeDocumentTitle("More Galleries");
    },

    methods: {

      getGalleriesData: function() {
        var vm = this;

        firebase.database().ref('galleries/descriptions').once('value').then(function(galleriesSnapshot) {
          var galleries = galleriesSnapshot.val();
          console.info({
            galleries
          });

          firebase.database().ref('galleries/entries').once('value').then(function(entriesSnapshot) {
            var galleryEntries = entriesSnapshot.val();
            console.info({
              galleryEntries
            });

            _.each(galleries, gallery => {
              var matchingEntries = _.chain(galleryEntries).where({ galleryId: gallery.galleryId }).sortBy('entryId').value();
              console.info({
                matchingEntries
              });

              gallery.thumbnailPath = vm.getThumbnailPath(matchingEntries[0]);

            });

            vm.galleries = _.sortBy(galleries, 'galleryId').reverse();
          });

        });

      },

      getThumbnailPath: function(entry) {
        return '/gallery/Z_' + entry.imageName.replace(/&/, '_');
      }

    }


  };

</script>
