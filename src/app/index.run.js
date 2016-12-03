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
      "Place ID" : "شناسه ی گروه",
      "The Place will be identified by this unique address. You can't change the Place ID after creating the Place, so choose wisely!" : "آی دی گروه را با دقت انتخاب کنید. زیرا بعدا قابل تغییر نیست.",
      "Add to my favored places." : "به گروه های مورد علاقه من اضافه کن",
      "Turn on notification for this place." : "رخداد های این گروه را به من اطلاع بده",
      "Create Place" : "ساخت گروه",
      "Closed Place" : "گروه بسته",
      "Place name" : "نام گروه",
      "Who can post messages to this Place?" : "چه کسی می تواند در این گروه بنویسد؟",
      "Which kind of members can be contribute in the place?" : "کدام گروه از اعضا می توانند مشارکت کنند؟",
      "ON" : "روشن",
      "OFF" : "خاموش",
      "Everyone" : "همه اعضا",
      "(including email)" : "(شامل ایمیل)",
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
      "All {{ ctlCreate.grandPlace.name }}Members can view Place contents." : "تمام اعضای {{ ctlCreate.grandPlace.name }} می توانند محتوای گروه را ببینند.",
      "First name": "نام",
      "Last Name": "نام خانوادگی",
      "Mobile phone": "تلفن همراه",
      "Gender": "جنسیت",
      "Date of Birth": "تاریخ تولد",
      "Change Password": "تغییر رمز عبور",
      "Save & Exit": "ذخیره و خروج",
      "Male": "مذکر",
      "Female": "مؤنث",
      "Other":"غیره",
      "Old Password": "رمز عبور قدیمی",
      "New Password": "رمز عبور جدید",
      "New Password Confirm": "تأیید رمز عبور جدید",
      "Change": "تغییر",
      "Profile": "نمایه",
      "Write your old password.": "رمز عبور قدیمی خود را بنویسید.",
      "Enter your new password.": "رمز عبور جدید خود را وارد نمایید.",
      "Retype your new password." : "مجدداً رمز عبور جدید خود را وارد نمایید.",
      "Old password is too short.": "رمز عبور قدیمی بسیار کوتاه است.",
      "Old password is too long." : "رمز عبوز قدیمی بسیار بلند است.",
      "Load more": "بارگیری بیش تر",
      "Place Name": "نام گروه",
      "Place description": "توصیف گروه",
      "Who can invite Members?": "چه کسی می تواند اعضا را دعوت کند؟",
      "Which members can post messages to this Place?": "کدام یک از اعضا می توانند در این گروه بنویسند؟",
      "Only Managers can post messages in this place.": "فقط مدیران می تواندد در این گروه بنویسند.",
      "Yes": "بله",
      "No": "خیر",
      "Remove": "حذف کردن",
      "Demote": "تنزل دادن",
      "Promote": "ترفیع دادن",
      "change": "تغییر",
      "Favorite Places": "گروه های مورد علاقه",
      "Place Settings": "تنظیمات گروه",
      "Invite Members": "دعوت اعضا",
      "Create an Open Place": "ساخت یک گروه باز",
      "Create a Closed Place": "ساخت یک گروه بسته",
      "Leave": "ترک کردن",
      "Leave and Delete": "ترک و حذف کردن",
      "Create a Personal place": "ساخت یک گروه شخصی",
      "Older comments...": "دیدگاه های قدیمی...",
      "Roll up": "جمع شدن",
      "write your comment ...": "دیدگاه خود را بنویسید ...",
      "No Permission": "دسترسی موجود نیست",
      "No comment": "دیدگاهی موجود نیست",
      "One comment": "یک دیدگاه",
      "comments": "دیدگاه ها",
      "Forward": "فرستادن",
      "Reply to all": "پاسخ به همه",
      "More Options": "انتخاب های دیگر",
      "to": "به",
      "Reply": "پاسخ",
      "Reply all": "پاسخ به همه",
      "Reply sender": "پاسخ ارسال کننده",
      "Delete": "حذف",
      "Retract": "ریترکت",
      "Reply to sender": "پاسخ ارسال کننده",
      "write your comment...": "دیدگاه خود را بنویسید...",
      "Add a Subject ...": "موضوع خود را اضافه کنید ...",
      "Your message goes here...": "پیام شما اینجا ارسال می شود...",
      "Type place name or email address...": "نام گروه یا آدرس رایانامه...",
      "To": "به",
      "Attach":"الصاق",
      "Send": "ارسال",
      "Discard": "رها کردن",
      "Back to Profile": "بازگشت به نمایه",
      "Recent Activities": "فعالیت های اخیر",
      "Mentions": "مرتبط های من",
      "Mark All as Read": "همه را به عنوان خوانده شده علامت بزن",
      "Unread": "خوانده نشده ها",
      "Write your message or drag your files here...": "پیام خود را بنویسید یا فایل های خود را در اینجا بیاندازید...",
      "Turn notification off": "اطلاع رسانی خویش را خاموش کنید",
      "More options": "انتخاب های دیگر",
      "Add to favorite places": "به گروه های مور علاقه ام اضافه شود",
      "Search in": "جستجو در",
      "There are no files here yet...": "هیچ فایلی هنوز موجود نیست...",
      "You reached the end of activities!": "شما به انتهای فعالیت ها رسیدید!",
      "There is not any activity here!": "هیچ فعالیتی در اینجا وجود ندارد!",
      "Add Members": "افزودن اعضا",
      "Import Contacts:": "وارد کردن ",
      "You can use a collective method for add members:": "شما می توانید از یک روش جمعی برای افزودن اعضا استفاده کنید:",
      "Invite": "دعوت",
      "Add": "افزودن",
      "Invite people by searching their name or entering their email or phone number.": "افراد را به وسیله ی جستجوی اسم شان یا ایمیل شان یا شماره ی تلفن شان دعوت کنید.",
      "Create an account": "ساخت یک حساب کاربری",
      "To creating a Nested account, please enter your phone number.": "برای ساخت یک حساب کاریری نستد لطفاً شماره ی خود را وارد کنید.",
      "Sign in": "ورود",
      "Recover your account": "بازیابی رمز عبور شما",
      "Enter your phone number to help you sign back in to Nested.": "وارد کردن شماره ی تلفن به شما کمک می کند به نستد بازگردید.",
      "Country": "کشور",
      "Select your country": "کشور خود را انتخاب کنید",
      "Phone number": "شماره ی تلفن",
      "Enter your phone number": "",
      "The provided phone number is not valid": "شماره ی تلفن ارائه شده معتبر نمی باشد",
      "Phone Verification": "تأیید تلفن",
      "We've sent a verification code via SMS to": "ما کد تأیید را از طریق پیامک خواهیم فرستاد",
      "It's not me!": "این من نیستم!",
      "6 letter and digits verification code" : "6 حرف و عدد کد تأیید",
      "Wrong Code": "کد اشتباه",
      "Reset Password" : "تنظیم مجدد رمز عبور",
      "To continue to your account you should enter new password.": "برای ادامه تا رسیدن به حساب کاربری خود باید رمز عبور جدید وارد کنید.",
      "Enter new password": "رمز عبور جدید را وارد کنید.",
      "Confirm new password": "تأیید رمز عبور جدید",
      "The confirmation should matches your password": "تایید باید منطبق با رمز عبور شما باشد",
      "Terms and Conditions": "شرایط و ضوابط",
      "By proceeding to create a Nested account, you are agreeing to our ": "توسط اقدام به ایجاد یک حساب کاربری نستد، شما موافقید با ما",
      "Email is not valid": "ایمیل معتبر نمی باشد",
      "Email": "ایمیل",
      "Last name is required": "نام خانوادگی ضروری است",
      "Last name": "نام خانوادگی",
      "First name is required": "نا ضروری است",
      "Password required" : "رمز عبور ضروری است",
      "Set a password" : "یک رمز عبور اتخاذ کنید",
      "Available": "موجود",
      "Not available": "ناموجود",
      "Username is required": "نام کاربری ضروری است",
      "Choose your username :": "نام کاربری خود را انتخاب کنید:",
      "Create a profile": "یک نمایه بسازید",
      "4-digits verification code": "کد تأیید 4 عددی",
      "That's not me!": "او من نیستم",
      "Phone verification": "تأیید تلفن",
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
