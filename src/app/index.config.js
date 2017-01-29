(function () {
  'use strict';

  angular
    .module('ronak.nested.web')
    .config(config);

  /** @ngInject */
  function config($logProvider, $locationProvider,  toastrConfig, markedProvider, localStorageServiceProvider,
                  $animateProvider) {


    localStorageServiceProvider
      .setPrefix('ronak.nested.web');

    // Enable log
    $logProvider.debugEnabled(true);

    // Omit # from routes
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');

    // Markdown Configs
    markedProvider.setOptions({
      gfm: false,
      tables: false,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: false,
      smartypants: false
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

    $animateProvider.classNameFilter(/use-ng-animate/);


    //Config ui-select-choices
    // force to open in down
    // uiSelectConfig.dropdownPosition = 'down';
  }
})();
