(function () {
  'use strict';

  angular
    .module('ronak.nested.web.main')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $uibModal, $timeout, $interval, $state,
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

    // $.get('/assets/locales/en-US.json', function (data) {
    //   setTimeout(function () {
    //     NstSvcI18n.addLocale("en-US", data);
    //   }, 3000);
    // });

    NstSvcI18n.addLocale("en-US", {});
    NstSvcI18n.addLocale("fa-IR", {
      "\n          {{ctlSettings.place.policy.add_post === &apos;creators&apos; ? &quot;Only Managers&quot; : &quot;All Members&quot;}} can post messages in this place.": " {{ctlSettings.place.policy.add_post === 'creators' ? \"فقط مدیران\" : \"همه ی اعضا\"}} می توانند به این گروه پیام دهند.",
      " New Message": "پیام جدید",
      " from": "از",
      "&quot;{{ ctlCreate.grandPlace.name }} Members": "{{ ctlCreate.grandPlace.name }}  اعضا",
      "&quot;{{ ctlCreate.grandPlace.name }}&quot; Members": "اعضای {{ ctlCreate.grandPlace.name }} ",
      "(including email)": "(شامل ایمیل)",
      "4-digits verification code": "کد تأیید 4 عددی",
      "6 letter and digits verification code": "6 حرف و عدد کد تأیید",
      "Activity": "فعالیت ها",
      "Add": "افزودن",
      "Add Members": "افزودن اعضا",
      "Add a Subject ...": "موضوع خود را اضافه کنید ...",
      "Add to my favored places.": "به گروه های مورد علاقه من اضافه کن",
      "All": "همه",
      "All <b>{{ ctlCreate.grandPlace.name }}</b> Members can post messages to the place.": "همه ی اعضای {{ ctlCreate.grandPlace.name }} می توانند به گروه پیام دهند.",
      "All <b>{{::ctlCreate.parentPlace.name}}</b> Members ({{::ctlCreate.parentPlace.getTeammatesCount()}})": "همه ی اعضای {{::ctlCreate.parentPlace.name}} {{::ctlCreate.parentPlace.getTeammatesCount()}})",
      "All <b>{{ctlCreate.grandPlace.name}}</b> Members ({{::ctlCreate.grandPlace.getTeammatesCount()}})": "همه ی اعضای {{ctlCreate.grandPlace.name}} ({{::ctlCreate.grandPlace.getTeammatesCount()}})",
      "All members": "همه ی اعضا",
      "All<b>&#xA0;{{ ctlCreate.grandPlace.name }}</b>Members can view Place contents.": "همه ی اعضای {{ ctlCreate.grandPlace.name }} می توانند محتوای گروه را ببینند.",
      "Are you sure you want to delete this place?": "آیا اطمینان دارید که می خواهید این گروه را حذف کنید؟",
      "Attach": "الصاق",
      "Attachments": "نمایش ضمیمه ها",
      "Available": "موجود",
      "Back to Profile": "بازگشت به نمایه",
      "By deleting place, all place data &amp; messages will be erased permanently. Are you really sure?": "با حذف این گروه تمام اطلاعات گروه و پیام ها به طور دائمی پاک خواهند شد. آیا کاملاً اطمینان دارید؟",
      "By proceeding to create a Nested account, you are agreeing to our ": "توسط اقدام به ایجاد یک حساب کاربری نستد، شما موافقید با ما",
      "Cancel": "لغو",
      "Change Password": "تغییر رمز عبور",
      "Choose your username :": "نام کاربری خود را انتخاب کنید:",
      "Click here to load messages!": "برای بارگیری پیام ها اینجا را بفشارید!",
      "Closed Place": "گروه بسته",
      "Collapsed View": "نمایش فشرده",
      "Comments": "دیدگاه ها",
      "Compose": "ارسال",
      "Confirm new password": "تأیید رمز عبور جدید",
      "Confirm to Delete Place": "تأیید حذف گروه",
      "Content Preview": "نمایش متن",
      "Country": "کشور",
      "Create New Place": "ساخت گروه جدید",
      "Create Place": "ساخت گروه",
      "Create a Closed Place": "ساخت یک گروه بسته",
      "Create a Personal place": "ساخت یک گروه شخصی",
      "Create a Place": "ساخت یک گروه",
      "Create a profile": "یک نمایه بسازید",
      "Create an Open Place": "ساخت یک گروه باز",
      "Create an account": "ساخت یک حساب کاربری",
      "DELETE": "حذف کردن",
      "Date of Birth": "تاریخ تولد",
      "Delete": "حذف",
      "Delete Place": "حذف گروه",
      "Demote": "تنزل دادن",
      "Discard": "رها کردن",
      "Do you want to leave": "آیا می خواهید ترک کنید؟  ",
      "Email is not valid": "ایمیل معتبر نمی باشد",
      "Empty post": "پیام خالی",
      "Enter new password": "رمز عبور جدید را وارد کنید.",
      "Enter your new password": "کلمه عبور جدید خود را وارد کنید.",
      "Enter your new password.": "رمز عبور جدید خود را وارد نمایید.",
      "Enter your phone number": "شماره ی خود را وارد نمایید.",
      "Enter your phone number to help you sign back in to Nested.": "وارد کردن شماره ی تلفن به شما کمک می کند به نستد بازگردید.",
      "Enter your place id": "شناسه ی گروه را وارد کنید.",
      "Everyone": "همه اعضا",
      "Everyone <i>(including email)</i>": "همه <i>(including email)</i>",
      "Everyone can send their messages to &quot;<b>{{ctlCreate.place.name ? ctlCreate.place.name  : &apos;...&apos;}}</b>&quot; Place.\n          This includes messages sent from email platforms to your Nested address ({{ ctlCreate.place.id }}@nested.me).": "همه می توانند پیام های شان را به گروه <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> ارسال کنند. این ارسال پیام ها از سایر رایانامه ها به رایانامه ی نستدتان  ({{ ctlCreate.place.id }}@nested.me) را نیز شامل می شود.",
      "Everyone can send their messages to &quot;<b>{{ctlSettings.place.name ? ctlSettings.place.name  : &apos;...&apos;}}</b>&quot; Place.\n        This includes messages sent from email platforms to your Nested address ({{ ctlSettings.place.id }}@nested.me).": "همه می توانند پیام های شان را به گروه <b>{{ctlSettings.place.name ? ctlSettings.place.name : '...'}}</b>ارسال کنند. این ارسال پیام ها از سایر رایانامه ها به رایانامه ی نستدتان  ({{ ctlSettings.place.id }}@nested.me) را نیز شامل می شود.",
      "Expanded View": "نمایش بسیط",
      "Favorite Places Feed": "گروه های مورد علاقه",
      "Feed": "خبرمایه",
      "Female": "مؤنث",
      "File Name": "نام فایل",
      "Files": "فایل ها",
      "Find files in this place": "جستجوی فایل های این گروه",
      "First name": "نام",
      "First name is required": "نا ضروری است",
      "Forgot Password?": "رمز عبور را فراموش کرده اید؟",
      "Forward": "فرستادن",
      "Gender": "جنسیت",
      "Invite": "دعوت",
      "Invite Members": "دعوت اعضا",
      "Invite people by searching their name or entering their email or phone number.": "افراد را به وسیله ی جستجوی اسم شان یا ایمیل شان یا شماره ی تلفن شان دعوت کنید.",
      "It&apos;s not me!": "این من نیستم!",
      "Joined": "ملحق شد",
      "Last Name": "نام خانوادگی",
      "Last name": "نام خانوادگی",
      "Last name is required": "نام خانوادگی ضروری است",
      "Latest Activity": "فعالیت های اخیر",
      "Latest Messages": "پیام های اخیر",
      "Leave": "ترک کردن",
      "Leave and Delete": "ترک و حذف کردن",
      "Leaving": "ترک کردن",
      "Load More...": "بارگیری بیش تر...",
      "Load more": "بارگیری بیش تر",
      "Loading": "در حال بارگیری",
      "Loading...": "درحال بارگذاری...",
      "Log out": "خروج",
      "Logs": "ثبت وقایع",
      "Male": "مذکر",
      "Manager Only": "فقط مدیر",
      "Managers of": "مدیران",
      "Managers of {{ctlCreate.place.name ? ctlCreate.place.name : &apos;...&apos;}}": "مدیران  {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}",
      "Managers of {{ctlSettings.place.name}}": "مدیران {{ctlSettings.place.name}}",
      "Mark All as Read": "همه را به عنوان خوانده شده علامت بزن",
      "Members": "اعضا",
      "Members of": "اعضای",
      "Members of {{ctlCreate.place.name ? ctlCreate.place.name : &apos;...&apos;}}": "اعضای {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}",
      "Members of {{ctlSettings.place.name}}": "اعضای {{ctlSettings.place.name}}",
      "Mention": "مرتبط با من",
      "Mentions": "مرتبط های من",
      "Messages": "پیام ها",
      "Mobile phone": "تلفن همراه",
      "NO": "خیر",
      "New Password": "رمز عبور جدید",
      "New Password Confirm": "تأیید رمز عبور جدید",
      "No": "خیر",
      "No Permission": "دسترسی موجود نیست",
      "No access": "دسترسی نیست",
      "No comment": "دیدگاهی موجود نیست",
      "No number or dash for start": "برای شروع دش و عدد استفاده نشود.",
      "None": "هیچکدام",
      "Not allowed to end with dash": "مجاز به استفاده از دش در پایان نمی باشید.",
      "Not available": "ناموجود",
      "OFF": "خاموش",
      "OK": "بله",
      "ON": "روشن",
      "Old Password": "رمز عبور قدیمی",
      "Old password is too long": "رمز عبور قدیمی بسیار طولانی است!",
      "Old password is too short": "کلمه ی عبور قدیمی بسیار کوتاه است",
      "Older comments...": "دیدگاه های قدیمی...",
      "One New Message": "یک پیام جدید",
      "One comment": "یک دیدگاه",
      "Only &quot;<b>{{ctlCreate.place.name ? ctlCreate.place.name : &apos;...&apos;}}</b>&quot; Members can view Place contents.": "فقط اعضای<b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> می توانند محتوای گروه را مشاهده کنند.",
      "Only &quot;{{ ctlCreate.grandPlace.name }}&quot; Members can post messages to &quot;<b>{{ ctlCreate.place.name }}</b>&quot; Place.": "فقط اعضای {{ ctlCreate.grandPlace.name }} می توانند در گروه <b>{{ ctlCreate.place.name }}</b> بنویسند.",
      "Only &quot;{{ctlSettings.place.name}}&quot; {{ctlSettings.place.policy.add_post === &apos;creators&apos; ? &quot;Managers&quot; : &quot;Members&quot;}}": "فقط {{ctlSettings.place.name}} {{ctlSettings.place.policy.add_post === 'creators' ? \"مدیران\" : \"اعضا\"}}",
      "Only Members can view Place contents.": "فقط اعضا می توانند طلاعات گروه را ببینند.",
      "Only Members of &quot;{{ctlCreate.place.name ? ctlCreate.place.name : &apos;...&apos;}}&quot;": "فقط اعضای {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}",
      "Only Nested Users": "فقط کاربران نستد",
      "Only Nested users can post messages to this Place.": "فقط اعضای نسنتد می توانند در این گروه بنویسند",
      "Only you": "فقط شما",
      "Only you can view the contents of this Place.": "فقط شما می توانید محتوای این گروه را مشاهده کنی.",
      "Only {{ ctlCreate.place.privacy.addPost === &apos;creators&apos;  ?  &quot;Managers&quot; : &quot;Members&quot; }} can post message to &quot;<b>{{ctlCreate.place.name ? ctlCreate.place.name : &apos;...&apos;}}</b>&quot; place.": "فقط می توانند {{ ctlCreate.place.privacy.addPost === 'creators' ? \"مدیران\" : \"اعضا\" }}در گروه <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> بنویسند.",
      "Only {{ ctlCreate.place.privacy.addPost === &apos;creators&apos;  ?  &quot;Managers&quot; : &quot;Members&quot; }} of &quot;{{ctlCreate.place.name ? ctlCreate.place.name : &apos;...&apos;}}&quot; Members": "فقط {{ ctlCreate.place.privacy.addPost === 'creators' ? \"مدیران\" : \"اعضا\" }}اعضای\r\n {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}",
      "Open Place": "گروه باز",
      "Other": "غیره",
      "Password": "رمز عبور",
      "Password required": "رمز عبور ضروری است",
      "Phone Verification": "تأیید تلفن",
      "Phone number": "شماره ی تلفن",
      "Phone verification": "تأیید تلفن",
      "Place ID": "شناسه ی گروه",
      "Place Privacy": "حریم گروه",
      "Place Settings": "تنظیمات گروه",
      "Place name": "نام گروه",
      "Place name is required<translate></translate>": "نام گروه ضروری است.",
      "Please confirm to leave the page": "لطفابرای ترکً تأیید کنید",
      "Profile &amp; Settings": "نمایه و تنظیمات",
      "Promote": "ترفیع دادن",
      "Received Date": "تاریخ دریافت",
      "Recent Activities": "فعالیت های اخیر",
      "Recover your account": "بازیابی رمز عبور شما",
      "Remove": "حذف کردن",
      "Removed": "حذف شد",
      "Reply": "پاسخ",
      "Reply all": "پاسخ به همه",
      "Reply sender": "پاسخ ارسال کننده",
      "Reply to sender": "پاسخ ارسال کننده",
      "Reset Password": "تنظیم مجدد رمز عبور",
      "Retract": "ریترکت",
      "Retype your new password": "مجدداً کلمه ی عبور جدید خود را بنویسید",
      "Retype your new password.": "مجدداً رمز عبور جدید خود را وارد نمایید.",
      "Roll up": "جمع شدن",
      "Search {{focussed ? 'Places, users and messages...' : '' }}": "جستجو  {{focussed ? 'گروه ها کاربران و پیام ها...' : '' }}",
      "Search {{focussed ? ('in ' + ctlFullNavbar.title) : ''}}": "جستجو  {{focussed ? ('in ' + ctlFullNavbar.title) : ''}}",
      "Select filter": "انتخاب نوع فیلتر",
      "Select group of members to be added to the place:": "گروهی از اعضا که می توانند زیر گروه اضافه کنند را انتخاب کنید:",
      "Select your country": "کشور خود را انتخاب کنید",
      "Send": "ارسال",
      "Send to": "ارسال",
      "Sent": "ارسال شده",
      "Sequence dashes (--) not allowed": "دش های متوالی جایز نمی باشد",
      "Set a password": "یک رمز عبور اتخاذ کنید",
      "Show in the search results?": "نمایش در نتیجه جستجو؟",
      "Show in the {{ ctlSettings.grandPlace.name }} Members search results?": "اعضای {{ ctlSettings.grandPlace.name }} را در جستجو نمایش داده شود.",
      "Sign in": "ورود",
      "Size": "حجم",
      "Sort by": "ترتیب بر اساس",
      "Stay signed in": "داخل باقی بمانید",
      "Terms and Conditions": "شرایط و ضوابط",
      "That&apos;s not me!": "آن من نیستم!",
      "The Place will be identified by this unique address. You <b>can&apos;t</b> change the Place ID after creating the Place, so choose wisely!<translate></translate>": "این گروه به وسیله ی این آدرس یگانه مشخص می شود. شما نمی توانید شناسه ی گروه را بعد از ساخت گروه تغییر دهید. بنابراین به خوبی انتخابش کنید.",
      "The confirmation password is not long enough": "تأییدیه کلمه ی عبور به اندازه ی کافی بلند نمی باشد.",
      "The confirmation should matches your password": "تایید باید منطبق با رمز عبور شما باشد",
      "The provided phone number is not valid": "شماره ی تلفن ارائه شده معتبر نمی باشد",
      "There are no files here yet...": "هیچ فایلی هنوز موجود نیست...",
      "There are no more files!": "فایل بیش تری موجود نیست!",
      "There are no more messages!": "پیامی موجود نمی باشد!",
      "There are no posts here yet...": "هنوز هیچ ‍یامی ارسال نشده است...",
      "There is not any activity here!": "هیچ فعالیتی در اینجا وجود ندارد!",
      "To": "به",
      "To confirm and delete the place, please type the place ID:": "برای تأیید و حذف گروه لطفاً شناسه ی گروه را وارد نمایید.",
      "To continue to your account you should enter new password.": "برای ادامه تا رسیدن به حساب کاربری خود باید رمز عبور جدید وارد کنید.",
      "To creating a Nested account, please enter your phone number.": "برای ساخت یک حساب کاریری نستد لطفاً شماره ی خود را وارد کنید.",
      "Turn on notification for this place.": "رخداد های این گروه را به من اطلاع بده",
      "Type place name or email address...": "نام گروه یا آدرس رایانامه...",
      "Unread": "خوانده نشده ها",
      "Username": "نام کاربری",
      "Username is required": "نام کاربری ضروری است",
      "View setting": "تنظیمات نمایش",
      "We&apos;ve sent a verification code via SMS to": "کد تأیید را از طریق پیامک ارسال خواهیم کرد",
      "Which kind of members can be contribute in the place?": "کدام گروه از اعضا می توانند مشارکت کنند؟",
      "Which members can post messages to this Place?": "کدام یک از اعضا می توانند در این گروه بنویسند؟",
      "Who can add Members?": "چه کسی می تواند اعضا را اضافه کند؟",
      "Who can create a sub-place?": "چه کسی می تواند یک زیر گروه ایجاد کند؟",
      "Who can invite Members?": "چه کسی می تواند اعضا را دعوت کند؟",
      "Who can post messages to this Place?": "چه کسی می تواند در این گروه بنویسد؟",
      "Write your message or drag your files here...": "پیام خود را بنویسید یا فایل های خود را در اینجا بیاندازید...",
      "Write your old password.": "رمز عبور قدیمی خود را بنویسید.",
      "Wrong Code": "کد اشتباه",
      "Yes": "بله",
      "You can use a collective method for add members:": "شما می توانید از یک روش جمعی برای افزودن اعضا استفاده کنید:",
      "You don&apos;t have access to reach this place !": "شما دسترسی به این گروه را ندارید!",
      "You don&apos;t have any unread messages.": "شما هیچ پیام نخوانده ای ندارید.",
      "You haven&apos;t favorited any Places yet...": "شما هنوز خبرمایه ی محبوبی از گروهی ندارید...",
      "You reached the end of activities!": "شما به انتهای فعالیت ها رسیدید!",
      "You will lose your draft. Are you sure you want to leave?": "شما درفت خود را از دست می دهید. آیا اطمینان دارید که می خواهید ترک کنید؟",
      "You&apos;ll lose any changes that you made by leaving": "شما با ترک کردن این گروه تمام تغییرات را از دست خواهید داد.",
      "Your message goes here...": "پیام شما اینجا ارسال می شود...",
      "Your new password is not long enough": "کلمه ی عبور جدید شما به اندازه ی کافی بلند نمی باشد.",
      "__version__": "نسخه",
      "all": "همه",
      "alphanumeric and dash (-) only": "فقط حروف الفبا و اعداد و خط فاصله",
      "audios": "صوتی",
      "change": "تغییر",
      "commented on": "دیدگاه گذاشت روی",
      "commented:": "دیدگاه گذاشت",
      "created": "را ساخت",
      "documents": "اسناد",
      "from": "از",
      "images": "تصاویر",
      "invited": "دعوت کرد",
      "joined": "به ملحق شد",
      "left": "را ترک کرد",
      "or": "یا",
      "others": "دیگر",
      "place?": "گروه را",
      "removed": "را حذف کرد",
      "text": "متن",
      "to": "به",
      "try again...": "مجدداً تلاش کنید...",
      "videos": "تصویری",
      "write your comment ...": "دیدگاه خود را بنویسید ...",
      "write your comment...": "دیدگاه خود را بنویسید...",
      "{{ ctlSettings.grandPlace.name }}Members": "اعضای {{ ctlSettings.grandPlace.name }}",
      "{{ctlFullNavbar.isGrandPlace ? &apos;Invite&apos; : &apos;Add &apos;}} Members": "{{ctlFullNavbar.isGrandPlace ? 'دعوت' : 'افزودن '}} اعضا",
      "{{ctlPostCard.post.commentsCount}} comments": "دیدگاه {{ctlPostCard.post.commentsCount}}",
      "{{ctlSettings.isGrandPlace ? &apos;Invite Members&apos; : &apos;Add Members&apos;}}": "{{ctlSettings.isGrandPlace ? 'دعوت اعضا' : 'افزودن اعضا'}}",
      "{{ctlTeammates.place.getTeammatesCount() }} Members": "عضو {{ctlTeammates.place.getTeammatesCount() }} "
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (!$rootScope.stateHistory) {
        $rootScope.stateHistory = [];
      }

      $rootScope.stateHistory.push({
        state: toState,
        params: toParams
      });

    });

  }
})();
