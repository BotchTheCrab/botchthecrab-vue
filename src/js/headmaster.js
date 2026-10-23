
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
  var MenuContentVue = require('components/partials/menu_content').default;
  var MenuTriggerVue = require('components/partials/menu_trigger').default;
  var BackToTopVue = require('components/partials/back_to_top').default;
  var FooterVue = require('components/partials/footer').default;
  var SfxVue = require('components/partials/sfx').default;

  // MAIN ROUTES
  var HomeVue = require('components/home').default;
  var PostingVue = require('components/posting').default;
  var PostingsVue = require('components/postings').default;
  var CreatePostingVue = require('components/posting-create').default;
  var TagsVue = require('components/tags').default;
  var ContactVue = require('components/contact').default;

  // ARCHIVE ROUTES
  var ArchiveVue = require('components/archive/archive_home').default;
  var FactionVue = require('components/archive/faction').default;
  var TeletranVue = require('components/archive/teletran').default;
  var TeletranMicromastersVue = require('components/archive/teletran_micromasters').default;
  var TechSpecsVue = require('components/archive/techspecs').default;
  var InstructionsVue = require('components/archive/instructions').default;
  var CatalogsVue = require('components/archive/catalogs').default;
  var BoxBattlesVue = require('components/archive/boxbattles').default;
  var ReinforcementsVue = require('components/archive/reinforcements').default;
  var HistoryVue = require('components/archive/history').default;

  // GALLERY ROUTES
  var GalleriesVue = require('components/galleries').default;
  var GalleryVue = require('components/gallery').default;
  var GalleryEntryVue = require('components/galleryEntry').default;

  // ABOUT ROUTES
  var AboutVue = require('components/about/about_home').default;
  var AboutAdamVue = require('components/about/about_adam').default;
  var AboutBotchVue = require('components/about/about_botch').default;
  var AboutTrioVue = require('components/about/about_trio').default;
  var AboutMusicVue = require('components/about/about_music').default;
  var AboutSiteVue = require('components/about/about_site').default;

  var NotFound = require('components/404.vue').default;

  var routes = [
    { path: '/', component: HomeVue },
    { path: '/posting/:postingId', name: 'posting', component: PostingVue },
    { path: '/postings', name: 'postings', component: PostingsVue },

    { path: '/posting/create/new', name: 'postingCreate', component: CreatePostingVue },
    { path: '/posting/:postingId/edit', name: 'postingEdit', component: CreatePostingVue },

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
    { path: '/about/site', component: AboutSiteVue },

    { path: '/:catchAll(.*)', component: NotFound }
  ];

  var router = new VueRouter({
    mode: 'history',
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
