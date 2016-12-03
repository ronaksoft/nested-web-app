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
      "Create New Place" : "ساخت گروه جدید",
      "Create a Place" : "ساخت یک گروه",
      "Place ID" : "آی دی گروه",
      "The Place will be identified by this unique address. You can't change the Place ID after creating the Place, so choose wisely!" : "آی دی گروه را با دقت انتخاب کنید. زیرا بعدا قابل تغییر نیست.",
      "Add to my favored places." : "به گروه های مورد علاقه من اضافه کن",
      "Turn on notification for this place." : "رخداد های این گروه را به من اطلاع بده",
      "Create Place" : "ساخت گروه",
      "Closed Place" : "گروه بسته",
      "Place name" : "نام گروه",
      "Who can post messages to this Place?" : "چه کسی می تواند در این گروه بنویسد؟",
      "Which kind of members can be contribute in the place?" : "کدام گروه از اعضا می توانند مشارکت کنند؟",
      "Show in the search results?" : "قابل جستجو باشد؟",
      "ON" : "روشن",
      "OFF" : "خاموش",
      "Everyone" : "همه اعضا",
      "(including email)" : "شامل ایمیل",
      "Show in the search results?" : "نمایش در نتیجه جستجو؟",
      "Place Privacy" : "حریم گروه",
      "Who can add Members?" : "چه کسی می تواند اعضا را اضافه کند؟",
      "Only Members can view Place contents." : "فقط اعضا می توانند طلاعات گروه را ببینند.",
      "Members" : "اعضا",
      "Who can create a sub-place?" : "چه کسی می تواند یک زیر گروه ایجاد کند؟",
      "Select group of members to be added to the place:" : "گروهی از اعضا که می توانند زیر گروه اضافه کنند را انتخاب کنید:",
      "None" : "هیچکدام",
      "One New Message" : "یک پیام جدید",
      "Loading..." : "درحال بارگذاری...",
      "There are no posts here yet..." : "هنوز هیچ ‍یامی ارسال نشده است...",
      "Open Place" : "گروه باز",
      "Expanded View": "نمایش بسیط",
      "Collapsed View": "نمایش فشرده",
      "All": "همه",
      "Logs": "ثبت وقایع",
      "Select filter": "انتخاب نوع فیلتر",
      "commented": "دیدگاه گذاشت",
      "created":"را ساخت",
      "removed": "را حذف کرد",
      "joined": "به ملحق شد",
      "from": "از",
      "left": "را ترک کرد",
      "commented on": "دیدگاه گذاشت روی",
      "Loading": "در حال بارگیری",
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
