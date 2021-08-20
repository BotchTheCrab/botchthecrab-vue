<style>

  #sfx {
  	display: none;
  	float: left;
  	width:	28px;
  	height:	32px;
  	background: no-repeat center center;
  	cursor:	pointer;
  }
  #sfx.audio_on  { background-image: url(/images/footer/icon_audio_on.png); }
  #sfx.audio_off { background-image: url(/images/footer/icon_audio_off.png); }

</style>

<template>

  <div id="sfx" class="audio_on" @click.prevent="toggleSfx">
    <audio id="sfx_control" volume="0.1">
      <source src="/archive/sounds/Transform.mp3" type="audio/mpeg" />
    </audio>
  </div>

</template>

<script>

  var cookiesService = require('services/cookies_service');

  var sfxStatus = false;

  function enableSfx() {
    var $sfx = $('#sfx');
    $sfx.attr('class', 'audio_on');
    $sfx.attr('title', 'mute transforming sound');
    playSfx();
  }

  function disableSfx() {
    var $sfx = $('#sfx');
    $sfx.attr('class', 'audio_off');
    $sfx.attr('title', 'unmute transforming sound');
  }

  function playSfx() {
    var $sfx_control = $('#sfx_control');
    $sfx_control.prop('volume', 0.3);
    $sfx_control.trigger('play');
  }

  function initSfx() {
    var $sfx = $('#sfx');
    var isMobile = $(document).width() < 450;

    if (!isMobile) {
      sfxStatus = cookiesService.readCookie('sfx') || 'audio_on';

      if (sfxStatus === 'audio_on') {
        enableSfx();
      } else {
        disableSfx();
      }
      $sfx.show();

    } else {
      $sfx.remove();
    }
  }

  module.exports = {

    mounted() {
      initSfx();

      this.$router.afterEach(function(to, from, each) {
        if (sfxStatus === 'audio_on') {
          playSfx();
        }
      });

    },

    methods: {

      toggleSfx: function() {
        if (sfxStatus == 'audio_on') {
          sfxStatus = 'audio_off'
          disableSfx();
        } else {
          sfxStatus = 'audio_on'
          enableSfx();
        }
        cookiesService.setCookie('sfx', sfxStatus);
      }

    }

  };

</script>
