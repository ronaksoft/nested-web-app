(function () {
  'use strict';

  angular
    .module('nested')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider,  toastrConfig, ipnConfig, markedProvider, localStorageServiceProvider, ScrollBarsProvider, $animateProvider) {

    localStorageServiceProvider
      .setPrefix('nested');

    // Enable log
    $logProvider.debugEnabled(true);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // International Phone Directive
    ipnConfig.defaultCountry = 'us';
    // ipnConfig.preferredCountries = ['ir', 'pl'];

    // Markdown Configs
    markedProvider.setOptions({
      sanitize: true
    });
    markedProvider.setRenderer({
      link: function(href, title, text) {
        return "<a href='" + href + "'" + (title ? " title='" + title + "'" : '') + " target='_blank'>" + text + "</a>";
      },
      heading: function (text) {
        return '<strong>' + text + '</strong>';
      },
      paragraph: function (text) {
        return text;
      }
    });

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 5000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventOpenDuplicates = true;
    toastrConfig.progressBar = true;

    // Scrollbars
    ScrollBarsProvider.defaults = {
      theme: 'minimal-dark',
      scrollInertia: 150,
      advanced: {
        updateOnContentResize: true
      },
      autoHideScrollbar: true
    };

    //config emojiOne
    emojione.imageType = 'svg';
    emojione.sprites = true;
    emojione.imagePathSVGSprites = './../bower_components/emojione/assets/sprites/emojione.sprites.svg';

    $animateProvider.classNameFilter(/use-ng-animate/);
  }
})();
