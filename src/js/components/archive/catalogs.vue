<style>

  #catalogs .teletranName {
    height: 70px;
  }
  #catalogs .teletranNameNote {
    margin-top: 0.5em;
  }

</style>

<template>

  <div class="container-fluid" id="catalogs">

    <archive-header></archive-header>

    <div class="teletranHeader">
  		<span class="teletranHeaderNeutral">Catalogs</span>
  	</div>

    <div class="galleryDescription">
      <p>
    		Man, I loved poring over these catalogs that came with boxed Tranformers back in the 1980's. I still do! I like checklists, I like Transformers, I love assigning numbers to things... What more can I ask for?
    	</p>
      <p>
        These toy catalogs are the somewhat formalized method by which fans have assigned a release year to all the classic Transformers, and it's the system I use as well for relegating box art entries to their respective years. Now that the Archive hosts Tech Spec scans and Instruction scans -- in addition to Box Art, of course -- it seemed only fitting to finally add the Catalogs that came with the toy.
    	</p>
    </div>

    <div id="teletranContainer" v-cloak>

      <div class="teletranEntry" v-for="catalog in catalogs">
        <div class="teletranBox">
          <a class="fancybox-button-art" rel="fancybox-button" v-bind:title="catalog.displayTitle" v-bind:href="catalog.imagePath" target="_blank">
            <img class="teletranThumb" v-bind:src="catalog.thumbnailPath" v-bind:title="catalog.displayName" />
          </a>
          <div class="teletranName">
            {{ catalog.displayName }}
            <div class="teletranNameNote" v-if="catalog.version">{{ catalog.version }} Version</div>
            <div class="teletranNameNote">Side {{ catalog.side }}</div>
          </div>
        </div>
      </div>

    </div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var ArchiveHeaderVue = require('components/archive/partials/archive_header');

  module.exports = {

    data () {
      return {
        catalogs: []
      }
    },

    components: {
      'archive-header': ArchiveHeaderVue
    },

    beforeMount() {
      this.getCatalogData();
    },

    mounted() {
      globalService.setArchiveDocumentTitle("Catalogs");
    },

    methods: {

      getCatalogData: function() {
        var vm = this;

        firebase.database().ref('archive/catalogs').once('value').then(function(snapshot) {
          var catalogs = snapshot.val();

          var mapped_catalogs = [];

          _.each(catalogs, function(catalog) {
            mapped_catalogs.push(_.extend({
              "side": "A"
            }, catalog));
            mapped_catalogs.push(_.extend({
              "side": "B"
            }, catalog));
          });

          _.each(mapped_catalogs, function(catalog) {
            catalog.displayName = vm.getDisplayName(catalog);
            catalog.displayTitle = vm.getDisplayTitle(catalog);
            catalog.thumbnailPath = vm.getThumbnailPath(catalog);
            catalog.imagePath = vm.getImagePath(catalog);
          });

          vm.catalogs = mapped_catalogs;
        });

      },

      getDisplayName: function(entry) {
        var displayName = entry.year;
        if (entry.region !== "USA") {
          displayName += " (" + entry.region + ")";
        }
        return displayName;
      },

      getDisplayTitle: function(entry) {
        var displayTitle = this.getDisplayName(entry);
        if (entry.version) {
          displayTitle += " (" + entry.version + " Version)";
        }
        displayTitle += " - Side " + entry.side;
        return displayTitle;
      },

      getImageName: function(entry) {
        var imageName = 'catalog_';
        if (entry.region !== 'USA') {
          imageName += entry.region.toLowerCase() + '_';
        }
        imageName += entry.year + '_';
        if (entry.version) {
          imageName += entry.version.toLowerCase() + '_';
        }
        imageName += entry.side.toLowerCase();
        imageName += '.jpg';

        return imageName;
      },

      getThumbnailPath: function(entry) {
        return '/archive/catalogs/Z_' + this.getImageName(entry);
      },

      getImagePath: function(entry) {
        return '/archive/catalogs/' + this.getImageName(entry);
      }

    }


  };

</script>
