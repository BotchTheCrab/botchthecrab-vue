
// READY
$(document).ready(function() {

  // Initialize Firebase
  var firebaseConfig = {
    apiKey: "AIzaSyCWCpbe1wdg1v1uJqPZRGv0q6pT8QZiscE",
    authDomain: "botch-the-crab.firebaseapp.com",
    databaseURL: "https://botch-the-crab.firebaseio.com",
    projectId: "botch-the-crab",
    storageBucket: "botch-the-crab.appspot.com",
    messagingSenderId: "957369815270",
    appId: "1:957369815270:web:3ca19aaadf385f84632b27"
  };
  firebase.initializeApp(firebaseConfig);

  // ARCHIVE ... or GLOBAL COMPONENTS ?
  var fancyboxService = require('services/fancybox_service.js');


  // Vue Router
  Vue.use(VueRouter);

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');
  var MenuContentVue = require('components/partials/menu_content');
  var MenuTriggerVue = require('components/partials/menu_trigger');
  var BackToTopVue = require('components/partials/back_to_top');
  var FooterVue = require('components/partials/footer');
  var SfxVue = require('components/partials/sfx');

  // MAIN ROUTES
  var HomeVue = require('components/home');
  var PostingVue = require('components/posting');
  var PostingsVue = require('components/postings');
  var TagsVue = require('components/tags');
  var ContactVue = require('components/contact');

  // ARCHIVE ROUTES
  var ArchiveVue = require('components/archive/archive_home');
  var FactionVue = require('components/archive/faction');
  var TeletranVue = require('components/archive/teletran');
  var TeletranMicromastersVue = require('components/archive/teletran_micromasters');
  var TechSpecsVue = require('components/archive/techspecs');
  var InstructionsVue = require('components/archive/instructions');
  var CatalogsVue = require('components/archive/catalogs');
  var BoxBattlesVue = require('components/archive/boxbattles');
  var ReinforcementsVue = require('components/archive/reinforcements');
  var HistoryVue = require('components/archive/history');

  // GALLERY ROUTES
  var GalleriesVue = require('components/galleries');
  var GalleryVue = require('components/gallery');
  var GalleryEntryVue = require('components/galleryEntry');

  // ABOUT ROUTES
  var AboutVue = require('components/about/about_home');
  var AboutAdamVue = require('components/about/about_adam');
  var AboutBotchVue = require('components/about/about_botch');
  var AboutTrioVue = require('components/about/about_trio');
  var AboutMusicVue = require('components/about/about_music');
  var AboutSiteVue = require('components/about/about_site');

  // var NotFound = require('components/404.vue');

  var routes = [
    { path: '/', component: HomeVue },
    { path: '/posting/:postingId', name: 'posting', component: PostingVue },
    { path: '/postings', name: 'postings', component: PostingsVue },
    { path: '/tags', component: TagsVue },
    { path: '/contact', component: ContactVue },

    { path: '/archive', component: ArchiveVue },
    { path: '/archive/teletran/:faction', component: FactionVue },
    { path: '/archive/teletran/:faction/:year', component: TeletranVue },
    { path: '/archive/teletran/:faction/:year/:micromasterTeam', component: TeletranMicromastersVue },
    { path: '/archive/techspecs', component: TechSpecsVue },
    { path: '/archive/instructions', component: InstructionsVue },
    { path: '/archive/catalogs', component: CatalogsVue },
    { path: '/archive/boxbattles', component: BoxBattlesVue },
    { path: '/archive/reinforcements', component: ReinforcementsVue },
    { path: '/archive/history', component: HistoryVue },

    { path: '/galleries', component: GalleriesVue },
    { path: '/gallery/:galleryId', name: 'gallery', component: GalleryVue },
    { path: '/gallery/galleryEntry/:galleryEntryId', name: 'galleryEntry', component: GalleryEntryVue },

    { path: '/about', component: AboutVue },
    { path: '/about/adam', component: AboutAdamVue },
    { path: '/about/botch', component: AboutBotchVue },
    { path: '/about/trio', component: AboutTrioVue },
    { path: '/about/music', component: AboutMusicVue },
    { path: '/about/site', component: AboutSiteVue }
  ];

  var router = new VueRouter({
    // mode: 'history',
    routes: routes
  });

  var MenuContent = new Vue({
    el: '#menu',
    components: {
      'menu-content': MenuContentVue
    }
  });
  var MenuTrigger = new Vue({
    el: '#menu_trigger_container',
    components: {
      'menu-trigger': MenuTriggerVue
    }
  });
  var BackToTop = new Vue({
    el: '#back-to-top',
    components: {
      'back-to-top': BackToTopVue
    }
  });
  var Footer = new Vue({
    el: '#footer',
    router: router,
    components: {
      'global-footer': FooterVue,
    }
  });
  var Sfx = new Vue({
    el: '#sfx-container',
    router: router,
    components: {
      'sfx': SfxVue,
    }
  });


  var main = new Vue({
    router: router
  }).$mount('#main');

  globalService.setBodyClass(globalService.getCurrentRoute());

  router.afterEach(function(to, from, each) {
    if (typeof window.triggerMenuUpdate === "function") {
      window.triggerMenuUpdate(to, from);
    }
    globalService.setBodyClass(to.path);
    globalService.scrollTop();
  });


  // FANCYBOX
  fancyboxService.initFancyBox();

});
