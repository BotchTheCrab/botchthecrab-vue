<style lang="scss">

  #about-music {

    .album {
      padding: 10px 20px;
      background-color: black;
      box-shadow: 3px 3px 3px #222;
      font-size: 0.9em;
      margin-bottom: 25px;
      text-align: left;

      iframe {
        float: left;
        border: 0;
        width: 100%;
        height: 500px;
        max-width: 350px;
        margin-bottom: 20px;
        margin-right: 20px;

        @media (max-width: 675px) {
          float: none;
          height: 405px;
        }
      }
    }

    .about-band, .album-title { text-shadow: 3px 3px 1px #444; }

    .about-band { font-size: 1.4em; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
    .about-title { font-size: 1.2em; font-style: italic; margin-left: 0px; }

    .album-blurb { margin: 10px 0; line-height: 1.5em; color: #bbb; min-height: 90px; }

    .album-links {
      text-align: center;

      a { margin: 0 15px; white-space: nowrap; }
    }

  }

</style>

<template>

  <div class="container-fluid" id="about-music">

    <div class="about-header">Music by <span class="nowrap">Adam Alexander</span></div>

    <div class="about-desc">I've played in a number of projects over the years. My role often changes: composer, singer, guitarist, bassist, piano and/or keyboardist, and so on. I keep busy. Here are all the albums that I've recorded with different bands.</div>


    <div v-bind:class="albumClasses" v-for="album in albums">
			<div class="album">
        <a v-bind:name="album.albumId"></a>
				<iframe v-bind:id="album.albumId" v-bind:src="getIframeSrc(album.bandcampIframeId)" seamless><a v-bind:href="album.bandcampUrl">{{ album.albumTitle }} by {{ album.bandName }}</a></iframe>

				<div class="about-band">{{ album.bandName }}</div>
				<div class="album-title">{{ album.albumTitle }}</div>

				<div class="album-blurb" v-html="album.blurb"></div>

				<div class="album-links">
					<a v-bind:href="album.bandcampUrl" target="bandcamp">Listen/Buy on Bandcamp</a>
          <a v-bind:href="album.websiteUrl" v-if="album.websiteUrl">DieLikeGentlemen.com</a>
          <a v-bind:href="album.facebookUrl" target="facebook" v-if="album.facebookUrl">Follow us on Facebook</a>
				</div>
				<br class="clearLeft" />
			</div>
		</div>

  </div>

</template>

<script>


  var albums = [
    {
      albumId: "Stories",
      bandName: "Die Like Gentlemen",
      albumTitle: "Stories",
      bandcampUrl: "https://dielikegentlemen.bandcamp.com/album/stories",
      websiteUrl: "https://dielikegentlemen.com/",
      facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
      blurb: "For some variety, Die Like Gentlemen started playing acoustic gigs in addition to our usual face-melting performances. Eventually we started writing original tunes for these gigs, and this grew into a quiet volume of material that deserved its own album.",
      bandcampIframeId: "922320776"
    },
    {
      albumId: "Quickening",
      bandName: "Die Like Gentlemen",
      albumTitle: "The Quickening Light",
      bandcampUrl: "https://dielikegentlemen.bandcamp.com/album/the-quickening-light",
      websiteUrl: "https://dielikegentlemen.com/",
      facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
      blurb: "Another ambitiuos prog/sludge album, with influences ranging from classic rock to death metal. Throw in some feedback and a small choir and you've got one more solid DLG disc.",
      bandcampIframeId: "243520918"
    },
    {
      albumId: "Lies",
      bandName: "Die Like Gentlemen",
      albumTitle: "Five Easy Lies",
      bandcampUrl: "https://dielikegentlemen.bandcamp.com/album/five-easy-lies",
      websiteUrl: "https://dielikegentlemen.com/",
      facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
      blurb: "Die Like Gentlemen has proven to be my most pure expression of heavy and progressive music. Plus, as far as sound quality, this is probably the most professional-sounding album I've done.",
      bandcampIframeId: "3743777813"
    },
    {
      albumId: "Delusions",
      bandName: "Die Like Gentlemen",
      albumTitle: "Romantic Delusions of Hell",
      bandcampUrl: "http://dielikegentlemen.bandcamp.com/album/romantic-delusions-of-hell",
      websiteUrl: "https://dielikegentlemen.com/",
      facebookUrl: "https://www.facebook.com/DieLikeGentlemen",
      blurb: "The debut album of my progressive sludge outfit here in Portland, OR. The songs are slow, heavy, dramatic and on the long side. The first album of my career actually released on vinyl.",
      bandcampIframeId: "1126785356"
    },
    {
      albumId: "Monster",
      bandName: "The Monster Project",
      albumTitle: null,
      bandcampUrl: "http://themonsterproject.bandcamp.com/",
      websiteUrl: null,
      facebookUrl: null,
      blurb: "My most ambitious undertaking ever, <b>The Monster Project</b> was a septet of progressive musicians executing my arrangements of monster movie music. We got a great response performing the selctions featured on this recording, including over 45 minutes of classic Godzilla music, a medley of 80's slasher movie themes, an excerpt from Tchaikovsky's <i>Swan Lake</i>, and selections from <i>Land of the Lost</i>.",
      bandcampIframeId: "432117078"
    },
    {
      albumId: "Invisible",
      bandName: "The Invincible Doctor Psyclops Invasion",
      albumTitle: "The Invisible Album",
      bandcampUrl: "http://drpsyclops.bandcamp.com/album/the-invisible-album",
      websiteUrl: null,
      facebookUrl: null,
      blurb: "This is the second Doctor Psyclops album, and possibly the most popular recording I've done. Though we lost none of our eccentricity, the Invasion really refined its unusual style. Much is still derived from improvisation, but there's also some exquisite and complicated compositions. At one point, I was performing with up to three keyboards, a laptop for samples, laser theremin, vocals with digital effects, hand percussion and a recorder!",
      bandcampIframeId: "1531036455"
    },
    {
      albumId: "Cardboard",
      bandName: "The Invincible Doctor Psyclops Invasion",
      albumTitle: "The Cardboard Album",
      bandcampUrl: "http://drpsyclops.bandcamp.com/album/the-cardboard-album",
      websiteUrl: null,
      facebookUrl: null,
      blurb: "From surf rock to arabic wailings to free noise and punk, the material on this disc amused and confused audiences for months. Inspired by The Invisibles comic series and Mr. Bungle, I was recruited by the Wicker Man to play keyboards, sing/scream/bellow, and wave my hand around a theremin.",
      bandcampIframeId: "1962577399"
    },
    {
      albumId: "Disagree",
      bandName: "I Disagree",
      albumTitle: "Vices & Virtues",
      bandcampUrl: "http://idisagree.bandcamp.com/album/vices-virtues",
      websiteUrl: null,
      facebookUrl: null,
      blurb: "This 13-song double-EP is the final culmination of three years of inspiration and frustration. After so many musically experimental projects, I wanted to simply sing for a heavy but groovy band, and that's what I found in Portland. Of course my desire to do things just a little bit differently always wins out, so these tracks have a touch of the unconventional anyway.<br/>By the way, album packaging is an origami-like affair that unfolds into a full-size poster with lyrics.",
      bandcampIframeId: "3374298948"
    },
    {
      albumId: "Cocktail",
      bandName: "Brompton's Cocktail",
      albumTitle: "Take On An Empty Mind",
      bandcampUrl: "http://bromptonscocktail.bandcamp.com/album/take-on-an-empty-mind",
      websiteUrl: null,
      facebookUrl: null,
      blurb: "With a bouncy, funerary theme, this eclectic \"art rock\" band mixed Beatles with Black Sabbath and everything in-between to put a grin on your face and death on the brain. I sang and played guitar, as well as wrote most the majority of the music on this eclectic disc. Though tuneful, the album is so all over the place that everyone who enjoys it cites a different favorite track. Decide for yourself!",
      bandcampIframeId: "1337885993"
    }
  ];


  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {
        albums: albums,
        albumClasses: "col-md-12 col-lg-6" // col-xl-4
      }
    },

    components: {
    },

    beforeMount() {
    },

    mounted() {
      globalService.setOfficeDocumentTitle("Music by Adam Alexander");
    },

    methods: {

      getIframeSrc: function(bandcampIframeId) {
    		return 'http://bandcamp.com/EmbeddedPlayer/album=' + bandcampIframeId + '/size=large/bgcol=333333/linkcol=ffffff/tracklist=false/transparent=true/';
      }

    },

    computed: {

    }


  };

</script>
