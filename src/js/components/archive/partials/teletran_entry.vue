<style>
  /* */
</style>

<template>

  <div class="teletranEntry">
    <div class="teletranBox">
      <a v-bind:class="imageClass" rel="fancybox-button" v-bind:title="entry.name" v-bind:data-character="entry.name" v-bind:data-techspecs="entry.hasTechSpec || 'false'" v-bind:data-instructions="entry.hasInstructions || 'false'" v-bind:href="imagePath" v-bind:target="imageTarget">
        <img class="teletranThumb" v-bind:src="thumbnailPath" v-bind:title="entry.name + ' - Box Art'" />
      </a>
      <div class="teletranIcons" v-if="!this.entry.transformerJapanId">
        <a v-if="entry.hasTechSpec" class="fancybox-button-techspecs" rel="fancybox-button" v-bind:title="entry.name + ' - Tech Specs'" v-bind:data-character="entry.name" data-art="true" v-bind:data-instructions="entry.hasInstructions || 'false'" v-bind:href="techSpecPath" target="_blank"><img src="/archive/images/icon_techspec.gif" v-bind:title="entry.name + ' - Tech Specs'" /></a>
        <a v-if="entry.hasInstructions" class="fancybox-button-instructions" rel="fancybox-button" v-bind:title="entry.name + ' - Instructions'" v-bind:data-character="entry.name" data-art="true" v-bind:data-techspecs="entry.hasTechSpec || 'false'" v-bind:href="instructionsPath" target="_blank"><img src="/archive/images/icon_instruction.gif" v-bind:title="entry.name + ' - Instructions'" /></a>
      </div>
      <div class="teletranName">
        {{ entry.name }}
        <div class="teletranNameNote" v-if="entry.note">({{ entry.note }})</div>
        <div class="teletranReleaseNumber" v-if="entry.releaseId">{{ entry.releaseId }}</div>
      </div>
    </div>
  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  module.exports = {
    props: ['entry'],

    methods: {
      getUnderscoreName: function(entry) {
        var underscoreName = archiveService.pathWash(entry.name);
        if (entry.note) {
          underscoreName += '_(' + archiveService.pathWash(entry.note) + ')';
        }
        return underscoreName;
      },
      getFactionPrefix: function(entry) {
        if (entry.faction) {
          return entry.faction.toLowerCase() + '/';
        }
        return '';
      },
      getImageName: function(entry) {
        return entry.imageName || this.getUnderscoreName(this.entry);
      }
    },

    computed: {

      imageClass: function() {
        if (this.entry.areMicromasters || this.entry.imageStatus){
          return '';
        }
        return 'fancybox-button-art';
      },

      imageTarget: function() {
        if (this.entry.areMicromasters || this.entry.imageStatus){
          return '_self';
        }
        return '_blank';
      },

      imagePath: function() {
        if (this.entry.imageStatus) {
          return '/#/archive/prisoners';
        }

        if (this.entry.areMicromasters){
          return '/#' + globalService.getCurrentRoute() + '/' + this.getUnderscoreName(this.entry);
        }

        var path = '/archive/' + this.getFactionPrefix(this.entry);
        if (this.entry.micromasterId) {
          path += this.entry.year + '/' + archiveService.pathWash(this.entry.team);
        } else if (this.entry.actionMasterId) {
          path += 'action_masters';
        } else if (this.entry.transformerJapanId) {
          path += 'japan';
        } else if (this.entry.transformerEuropeId) {
          path += 'europe';
        } else if (this.entry.year) {
          path += this.entry.year;
        }
        path += '/' + this.getImageName(this.entry) + '.jpg';
        return path;
      },

      thumbnailPath: function() {
        if (this.entry.imageStatus === 'missing') {
          return '/archive/images/Z_image_missing.gif';
        }
        if (this.entry.imageStatus === 'unedited') {
          return '/archive/images/Z_image_unedited.gif';
        }

        var path = '/archive/' + this.getFactionPrefix(this.entry);
        if (this.entry.micromasterId) {
          path += this.entry.year + '/' + archiveService.pathWash(this.entry.team);
        } else if (this.entry.actionMasterId) {
          path += 'action_masters';
        } else if (this.entry.transformerJapanId) {
          path += 'japan';
        } else if (this.entry.transformerEuropeId) {
          path += 'europe';
        } else if (this.entry.year) {
          path += this.entry.year;
        }
        path += '/Z_' + this.getImageName(this.entry) + '.gif';
        return path;
      },

      techSpecPath: function() {
        var path = '/archive/techspecs/' + this.getFactionPrefix(this.entry);
        if (this.entry.actionMasterId) {
          path += 'action_masters';
        // } else if (this.entry.transformerJapanId) {
        //   path += 'japan';
        } else if (this.entry.transformerEuropeId) {
          path += 'europe/' + this.entry.year;
        } else if (this.entry.year) {
          path += this.entry.year;
        }
        path += '/ts_' + this.getImageName(this.entry) + '.jpg';
        return path;
      },

      instructionsPath: function() {
        var path = '/archive/instructions/' + this.getFactionPrefix(this.entry);
        if (this.entry.actionMasterId) {
          path += 'action_masters';
        // } else if (this.entry.transformerJapanId) {
        //   path += 'japan';
        } else if (this.entry.transformerEuropeId) {
          path += 'europe/' + this.entry.year;
        } else if (this.entry.year) {
          path += this.entry.year;
        }
        path += '/instr_' + this.getImageName(this.entry) + '.jpg';
        return path;
      }

    }


  };

</script>
