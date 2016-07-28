(function() {
  'use strict';

  angular
    .module('nested')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider, toastrConfig, ipnConfig, markedProvider, localStorageServiceProvider, ScrollBarsProvider) {

    localStorageServiceProvider
      .setPrefix('nested');

    // Enable log
    $logProvider.debugEnabled(true);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // International Phone Directive
    ipnConfig.defaultCountry = 'ir';
    ipnConfig.preferredCountries = ['ir', 'pl'];

    // Markdown Configs
    markedProvider.setOptions({
      sanitize: true
    });
    markedProvider.setRenderer({
      heading: function (text) {
        return '<strong>' + text + '</strong>';
      },
      paragraph: function (text) {
        return text;
      }
    });

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;

    // Scrollbars
    ScrollBarsProvider.defaults = {
      theme: 'minimal-dark',
      scrollInertia: 300,
      advanced:{
        updateOnContentResize: true
      },
      autoHideScrollbar: true
    };

 //config emojiOne
    emojione.imageType = 'svg';
    emojione.sprites = true;
    emojione.imagePathSVGSprites = './../bower_components/emojione/assets/sprites/emojione.sprites.svg';


  }


})();
