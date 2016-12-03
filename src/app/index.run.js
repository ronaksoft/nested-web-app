(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $uibModal, $timeout,$interval, $state,
                    ngProgressFactory,
                    NST_CONFIG, NST_UNREGISTER_REASON, NST_AUTH_EVENT, NST_LOADER_EVENT,
                    NstSvcAuth, NstSvcLoader, NstSvcI18n) {

    $rootScope.progress = {
      bar: ngProgressFactory.createInstance(),
      fn: {
        start: function () {
          $rootScope.progress.bar.start();
        },
        complete: function () {
          $rootScope.progress.bar.complete();
        },
        stop: function () {
          $rootScope.progress.bar.stop();
        },
        reset: function () {
          $rootScope.progress.bar.reset();
        }
      }
    };

    $rootScope.progress.bar.setHeight('5px');
    // $rootScope.progress.bar.setColor('#14D766');

    NstSvcLoader.addEventListener(NST_LOADER_EVENT.INJECTED, function () {
      $rootScope.progress.fn.start();
    });

    NstSvcLoader.addEventListener(NST_LOADER_EVENT.FINISHED, function (event) {
      if (event.detail.rejected > 0) {
        $rootScope.progress.fn.reset();
      } else {
        $rootScope.progress.fn.complete();
      }
    });

    $rootScope.modals = {};

    //Config Tiny-MCE base url
    if (NST_CONFIG.TINY_MCE_ASSETS_PATH) {
      tinyMCE.baseURL = NST_CONFIG.TINY_MCE_ASSETS_PATH;
    }


    NstSvcI18n.addLocale("en-US", {
      "Messages" : "پیام ها",
      "Activity" : "فعالیت ها",
      "Files" : "فایل ها",
      "Latest Messages" : "پیام های اخیر",
      "Latest Activity" : "فعالیت های اخیر",
      "All Places Feed" : "گروه ها",
      "All Places" : "همه گروه ها",
      "Favorite Places Feed" : "گروه های مورد علاقه",
      "Sent Messages" : "‍پیام های ارسال شده",
      "Profile & Settings" : "تنظیمات من",
      "Log out" : "خروج",
      "Compose" : "ارسال",
      "Mention" : "مرتبط با من",
      "Search" : "جستجو",
      "Recent Activity" : "فعالیت های اخیر",
      "Sent" : "ارسال شده",
      "Sort by" : "ترتیب بر اساس",
      "View setting" : "تنظیمات نمایش",
      "Content Preview" : "نمایش متن",
      "Attachments" : "نمایش ضمیمه ها",
      "Comments" : "دیدگاه ها",
      "Foo" : "فو",
      "File Name" : "نام فایل",
      "Send to" : "ارسال",
      "Size" : "حجم",
      "Received Date" : "تاریخ دریافت",
      "Find files in this place" : "جستجوی فایل های این گروه",
      "all" : "همه",
      "documents" : "اسناد",
      "images" : "تصاویر",
      "audios" : "صوتی",
      "videos" : "تصویری",
      "others" : "دیگر",
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (!$rootScope.stateHistory) {
        $rootScope.stateHistory = [];
      }

      $rootScope.stateHistory.push({
        state : toState,
        params : toParams
      });

    });

  }
})();
