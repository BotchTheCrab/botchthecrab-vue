var fancyBoxDefaults = {
  prevEffect: 'fade',
  nextEffect: 'fade',
  arrows: true,
  closeBtn: true,
  loop: false,
  helpers: {
    title: { type : 'inside' }
  },
  minWidth: 225,
  minHeight: 50,
  margin: 50,
  padding: 20
}

var fancyBoxSwipeInitialized = false;

module.exports = {
  // initFancyBoxSwipe: initFancyBoxSwipe,
  buildFancyboxPopIcon: buildFancyboxPopIcon,
  initFancyBox: initFancyBox,
  openBoxArt: openBoxArt,
  openTechSpecs: openTechSpecs,
  openInstructions: openInstructions,
  openImage: openImage
};

////////////

/* function initFancyBoxSwipe() {
  if (!fancyBoxSwipeInitialized) {
    fancyBoxSwipeInitialized = true;

    $('body').on('swipe', {
      swipeLeft:function(event, direction, distance, duration, fingerCount){
        $('.fancybox-next').trigger('click');
      },
      swipeRight:function(event, direction, distance, duration, fingerCount){
        $('.fancybox-prev').trigger('click');
      },
      threshold:100
    });

  }
} */

/* function clearFancyBoxSwipe() {
  $('body').off('swipe');
  fancyBoxSwipeInitialized = false;
} */

function buildFancyboxPopIcon(href) {
  return '<div class="fancybox-download" title="open image in new window">' +
    '<a href="' + href + '" target="_blank">' +
      '<img src="/images/icon_newwin.png" />' +
    '</a>' +
  '</div>';
}

function initFancyBox() {

  var buildFancyboxPopIcon = this.buildFancyboxPopIcon;

  _.extend(window, {
    openBoxArt: this.openBoxArt,
    openTechSpecs: this.openTechSpecs,
    openInstructions: this.openInstructions
  });

  // art
  $(".fancybox-button-art").fancybox($.extend({
    beforeLoad: function() {
      var title = $(this.element).data('title');
      var hasTechSpecs = Boolean($(this.element).data('techspecs'));
      var hasInstructions = Boolean($(this.element).data('instructions'));

      this.title = buildFancyboxPopIcon(this.href) + title;

      if (hasTechSpecs || hasInstructions) {
        var links = '<div class="fancybox-additional-links">';
        if (hasTechSpecs) {
          links += '<a class="open-techspecs" href="javascript:void(openTechSpecs(\'' + title + '\'))">Tech Specs</a>';
        }
        if (hasInstructions) {
          links += '<a class="open-instructions" href="javascript:void(openInstructions(\'' + title + '\'))">Instructions</a>';
        }
        links += '</div>';
        this.title += links;
      }
    },
    // afterLoad: initFancyBoxSwipe
  }, fancyBoxDefaults));

  // techspecs
  $(".fancybox-button-techspecs").fancybox($.extend({
    beforeLoad: function() {
      var title = $(this.element).data('title');
      var hasBoxArt = Boolean($(this.element).data('art'));
      var hasInstructions = Boolean($(this.element).data('instructions'));

      this.title = buildFancyboxPopIcon(this.href) + this.title;

      if (hasBoxArt || hasInstructions) {
        var links = '<div class="fancybox-additional-links">';
        if (hasBoxArt) {
          links += '<a class="open-boxart" href="javascript:void(openBoxArt(\'' + title + '\'))">Box Art</a>';
        }
        if (hasInstructions) {
          links += '<a class="open-instructions" href="javascript:void(openInstructions(\'' + title + '\'))">Instructions</a>';
        }
        links += '</div>';
        this.title += links;
      }
    },
    // afterLoad: initFancyBoxSwipe
  }, fancyBoxDefaults));

  // instructions
  $(".fancybox-button-instructions").fancybox($.extend({
    beforeLoad: function() {
      var title = $(this.element).data('title');
      var hasBoxArt = Boolean($(this.element).data('art'));
      var hasTechSpecs = Boolean($(this.element).data('techspecs'));

      this.title = buildFancyboxPopIcon(this.href) + this.title;

      if (hasBoxArt || hasTechSpecs) {
        var links = '<div class="fancybox-additional-links">';
        if (hasBoxArt) {
          links += '<a class="open-boxart" href="javascript:void(openBoxArt(\'' + title + '\'))">Box Art</a>';
        }
        if (hasTechSpecs) {
          links += '<a class="open-techspecs" href="javascript:void(openTechSpecs(\'' + title + '\'))">Tech Specs</a>';
        }
        links += '</div>';
        this.title += links;
      }
    },
    // afterLoad: initFancyBoxSwipe
  }, fancyBoxDefaults));

}

// direct link to open Box Art from fancyBox
function openBoxArt(title) {
  // close the character art
  $.fancybox.close(true);
  // find the character's tech spec link
  var BoxArt = $('.fancybox-button-art').filter('[title="' + title + '"]');
  // trigger the click
  BoxArt.trigger('click');
}

// direct link to open Tech Specs from fancyBox
function openTechSpecs(title) {
  // close the character art
  $.fancybox.close(true);
  // find the character's tech spec link
  var TechSpecs = $('.fancybox-button-techspecs').filter('[title="' + title + ' - Tech Specs"]');
  // trigger the click
  TechSpecs.trigger('click');
}

// direct link to open Instructions from fancyBox
function openInstructions(title) {
  // close the character art
  $.fancybox.close(true);
  // find the character's tech spec link
  var Instructions = $('.fancybox-button-instructions').filter('[title="' + title + ' - Instructions"]');
  // trigger the click
  Instructions.trigger('click');
}

// open single image
function openImage(imgName, imgSrc) {
  $.fancybox.open([{
    href : imgSrc,
    title : buildFancyboxPopIcon(imgSrc) + imgName
  }], fancyBoxDefaults);
}
