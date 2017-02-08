(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .constant('NST_LOCALE_FA_IR', {
      "_direction": "rtl",
      "0": "۰",
      "1": "۱",
      "2": "۲",
      "3": "۳",
      "4": "۴",
      "5": "۵",
      "6": "۶",
      "7": "۷",
      "8": "۸",
      "9": "۹",
      " accepted your invitation to {{notification.invitation.place.name}} (#{{notification.invitation.place.id}})": "دعوت به{{notification.invitation.place.name}} (#{{notification.invitation.place.id}}) Place را پذیرفت.",
      "1 new comment": "۱ نظر جدید",
      "6-digit verification code": "کد امنیتی 6 رقمی",
      "<a>{{ ::notification.joined.sender.fullName }}</a><br>\n          <small>is now on nested</small>": "<a>{{ ::notification.joined.sender.fullName }}</a><br> <small>عضو نستد است</small>",
      "<b>{{ ::notification.invitation.inviter.fullName }}</b> invited you to <b>{{notification.invitation.place.name}} (#{{notification.invitation.place.id}})</b>": "<b>{{ ::notification.invitation.inviter.fullName }}</b> شما را به <b>{{notification.invitation.place.name}} (#{{notification.invitation.place.id}})</b>دعوت کرد",
      "Activities": "فعالیت‌ها",
      "Add": "اضافه کردن",
      "Add Members": "اضافه کردن اعضا",
      "Add a subject line...": "موضوع پست",
      "Add to favorite places": "اضافه به Place علاقه مندی ها",
      "Add to my Favorites": "افزودن به علاقمندی‌ها",
      "All": "همه موارد",
      "All <b>{{ ctlCreate.grandPlace.name }}</b> Members can post messages to this Place.": "همه اعضای All <b>{{ ctlCreate.grandPlace.name }}</b> می‌توانند در این Place  پست بگذارند.",
      "All <b>{{ctlCreate.grandPlace.name}}</b> Members ({{ctlCreate.grandPlace.getTeammatesCount() | localize}})": "همه اعضای <b>{{ctlCreate.grandPlace.name}}</b> ({{ctlCreate.grandPlace.getTeammatesCount() | localize}})",
      "All <b>{{ctlCreate.grandPlace.name}}</b> Members can view Place contents.": "همه اعضای<b>{{ctlCreate.grandPlace.name}}</b>می‌توانند محتوای درون Place‌را ببینند.",
      "All <b>{{ctlCreate.parentPlace.name}}</b> Members ({{ctlCreate.parentPlace.getTeammatesCount() | localize}})": "همه اعضای <b>{{ctlCreate.parentPlace.name}}</b> ({{ctlCreate.parentPlace.getTeammatesCount() | localize}})",
      "All <b>{{ctlSettings.grandPlace.name}}</b> Members can post messages to this Place.": "همه اعضای <b>{{ctlSettings.grandPlace.name}}</b> می‌توانند در Place ‌پست بگدارند.",
      "All Members": "همه اعضا",
      "All Members can post messages to this Place.": "همه اعضا می توانند به این Place پست ارسال کنند.",
      "Alright": "مورد تایید",
      "An error has occurred in removing this Place.": " خطا در پاک کردن این Place",
      "An error has occurred in sending a new verification code.": " خطا در ارسال کد امنیتی جدید",
      "An error has occurred in the retraction of the message.": "خطا در بازگرداندن پست ",
      "An error has occurred in trying to reach you via phone call.": "خطا در برقراری ارتباط با شما از طریق تماس تلفنی .",
      "An error has occurred in trying to remove this message from the selected Place.": "خطا درعملیات حذف پست از Place",
      "An error has occurred in updating the Place photo.": "خطا در به روز رسانی تصویر Place.",
      "An error has occurred while retrieving files.": "خطا در بازیابی فایل ها.",
      "An error occured while tying to show the post full body.": "خطا در نمایش کامل متن پست",
      "Are you sure you want to delete post {0} from Place {1}?": "از حذف پست{0} از Place{ {1مطمئن هستید؟",
      "Are you sure you want to delete the post from Place {0}?": "از حذف پست از Place{0}مطمئن هستید؟",
      "Are you sure you want to delete this Place?": "از حذف این Place مطمئن هستید؟",
      "Are you sure you want to retract this message? This action will delete the message from all the recipients and cannot be undone.": "از بازگرداندن این پیام مطمئن هستید؟حذف پست ازتمام گیرنده‌ها و غیرقابل بازگشت است.",
      "Attachments": "پیوست‌ها",
      "Back to the profile": "بازگشت به پروفایل",
      "Bookmarked": "نشانک‌ها",
      "Bookmarks": "نشانک‌ها",
      "By deleting place, you are agreeing to erase all Place data permanently. Are you sure you want to do this?": "حذف کامل Place و پاک شدن تمامی اطلاعات! مطمئن هستید؟ ",
      "By discarding this message, you will lose your draft. Are you sure you want to discard?": "حذف کامل پیش نویس پیام! مطمئن هستید؟",
      "By proceeding to create a Nested account, you are agreeing to our <a href=\"https://help.nested.me/terms/index.html\" class=\"nst-mood-cheerful\">Terms and Conditions</a>.": "با ساخت حساب کاربری نستد، قوانین و مقررات <a href=\"https://help.nested.me/terms/index.html\" class=\"nst-mood-cheerful\">ما را پذیرفته اید. </a>",
      "Call": "تماس",
      "Cancel": "لغو",
      "Change": "تغییر",
      "Change place ID": "تغییر شناسه Place",
      "Change your password": "تغییر رمز عبور",
      "Choose your username:": "انتخاب نام کاربری",
      "Click here to load more messages": "پست‌های بیشتر...",
      "Closed Place": "Private Place",
      "Collapsed View": "نمای کمتر",
      "Comments": "نظرات ",
      "Compose": "نوشتن",
      "Confirm": "تایید",
      "Confirm new password": "تایید  رمز عبور جدید",
      "Confirm to delete this Place": "تایید حذف Place",
      "Content Preview": "نمایش محتوا",
      "Conversation with:": "گفتگو با",
      "Country": "کشور",
      "Create a Closed Place": "ساخت Private Place",
      "Create a Place": "ساخت Place",
      "Create a new Place": "ساخت Place جدید",
      "Create a profile": "ساخت پروفایل ",
      "Create an Open Place": "ساخت Common Place",
      "Create an account": "ساخت حساب کاربری",
      "Date of Birth": "تاریخ تولد",
      "Delete": "پاک کردن",
      "Demote": "محدود کردن دسترسی",
      "Discard": "لغو",
      "Do you want to leave \"{{leaveCtrl.placeTitle}}\"?": "می خواهید \"{{leaveCtrl.placeTitle}}\" را ترک کنید؟",
      "Don\\'t end your username with a dash (-)": "در پایان نام کاربری نمی‌توانید از (-) استفاده کنید .",
      "Don\\'t start your username with a number (0-9) or a dash (-)": " نام کاربری نمیتواندبا اعداد(۰-۹) و (-) آغاز شود.",
      "Download": "دانلود",
      "Edit profile": "ویرایش پروفایل",
      "Either this Place doesn't exist, or you don't have the permit to enter the Place.": "در هر صورت یا این Place وجود ندارد، یا شما اجازه ورود به آن Place‌را ندارید.",
      "Email": "ایمیل",
      "Enter a Place name or a Nested address...": "وارد کردن نام Place یا آدرس نستد...",
      "Enter a new password": "ورود یک رمز عبور جدید.",
      "Enter your new password": "ورود رمز عبور جدید.",
      "Enter your old password": "ورود رمز عبور قبلی خود.",
      "Enter your phone number": "ورود شماره تلفن همراه. ",
      "Enter your place ID": "ورود شناسه Place ",
      "Error": "خطا",
      "Everyone": "همه دارندگان ایمیل",
      "Everyone <i>(including email)</i>": "همه دارندگان ایمیل <i>(including email)</i>",
      "Everyone can send their messages to <b>...</b> Place. This includes messages sent from different email platforms to your Nested address ({{ctlCreate.place.id}}@nested.me).": "همه کاربران اینترنتی داری ایمیل‌های متفاوت می‌توانند بهPlace‌ <b>...</b>به آدرس نستد({{ctlCreate.place.id}}@nested.me)پست ارسال کنند",
      "Everyone can send their messages to <b>...</b> Place. This includes messages sent from email platforms to your Nested address ({{ctlSettings.place.id}}@nested.me).": "همه کاربران اینترنتی داری سرویس ایمیل‌می‌توانند بهPlace <b>...</b> به آدرس نستد({{ctlCreate.place.id}}@nested.me) پست ارسال کنند.",
      "Everyone can send their messages to <b>{{ctlCreate.place.name}}</b> Place. This includes messages sent from different email platforms to your Nested address ({{ctlCreate.place.id}}@nested.me).": "همه کاربران اینترنتی داری ایمیل‌های متفاوت می‌توانند به Place  <b>{{ctlCreate.place.name}}</b>از ایمیل سرویس‌های مختلف به آدرس نستد ({{ctlCreate.place.id}}@nested.me)پست ارسال کنند.",
      "Everyone can send their messages to <b>{{ctlSettings.place.name}}</b> Place. This includes messages sent from email platforms to your Nested address ({{ctlSettings.place.id}}@nested.me).": "همه کاربران اینترنتی داری ایمیل‌های متفاوت می‌توانند به Place  <b>{{ctlCreate.place.name}}</b>از ایمیل سرویس‌های مختلف به آدرس نستد ({{ctlCreate.place.id}}@nested.me)پست ارسال کنند.",
      "Expanded View": "نمای بیشتر",
      "Feed": "خوراک",
      "Female": "زن",
      "File name": "اسم فایل",
      "Files": "فایل‌ها",
      "Find files in this place": "جستجو فایل ها در این‌ Place",
      "Finish": "اتمام ثبت نام",
      "First name": "نام",
      "First name is required": "ورود نام ",
      "Forgot Password?": "فراموشی رمز عبور؟",
      "Forward": "فرستادن",
      "Full view": "نمایش کامل",
      "Gender": "جنسیت",
      "Help center": "پشتیبانی",
      "Home": "صفحه اصلی",
      "I'm sure": "بله",
      "Install apps": "نصب اپلیکیشن",
      "Invitation to {0}": "دعوت به {0}",
      "Invitation to {0} by {1}.": "دعوت به {0} توسط {1}.",
      "Invite": "دعوت",
      "Invite Members": "دعوت اعضا",
      "Invite new Members": "دعوت اعضا جدید",
      "Invite new people by searching their name, entering their email, or phone number.": "دعوت از افراد جدید با نام، ایمیل و یا شماره تلفن همراه",
      "Language": "زبان",
      "Latest Activity": "آخرین فعالیت‌",
      "Leave": "ترک کردن",
      "Leave and Delete": "ترک و حذف",
      "Leaving {{leaveCtrl.place.name}}": "ترک {{leaveCtrl.place.name}}",
      "Load more...": "بارگیری بیشتر ...",
      "Loading...": "بارگیری...",
      "Log out": "خروج",
      "Logs": "لاگ‌ها",
      "Male": "مرد",
      "Manager": "مدیر",
      "Manager(s) only": "فقط مدیر/مدیران ",
      "Managers": "مدیران",
      "Managers of {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}": "مدیران {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}\r\n\r\n\r\n",
      "Managers of {{ctlSettings.place.name}}": "مدیران {{ctlSettings.place.name}}",
      "Member": "عضو",
      "Members": "عضو",
      "Members of {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}": "اعضای {{ctlCreate.place.name ? ctlCreate.place.name : '...'}}",
      "Members of {{ctlSettings.place.name}}": "اعضای {{ctlSettings.place.name}}",
      "Message Sent": "ارسال پست",
      "Message didn\\'t send": "عدم ارسال پست",
      "Message sent": "پست ارسال شد ",
      "Messages": "پست‌ها",
      "Mobile phone": "شماره تلفن همراه",
      "More options": "امکانات بیشتر",
      "Name or ID...": "نام یا شناسه ",
      "Name, email or phone number...": "نام، ایمیل یا تلفن همراه",
      "New Password": "رمز عبور جدید",
      "New message": "پست جدید",
      "Next": "بعدی",
      "No": "خیر",
      "No access": "عدم دسترسی",
      "No comments": "پستی وجود ندارد",
      "No more files here!": "فایل دیگری وجود ندارد!",
      "No more messages here!": "پست دیگری وجود ندارد!",
      "No-one": "هیچ کس",
      "Notifications": "اعلان",
      "Off": "خاموش",
      "Old Password": "رمز عبور قبلی",
      "On": "روشن",
      "One New Message": "یک پست جدید",
      "One comment": "یک نظر",
      "One post": "یک پست ",
      "Only <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> Members can view the contents of this Place.": "فقط اعضای <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b>می‌توانند محتوای Place را ببینند. ",
      "Only Managers can post messages to <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> Place.": "فقط مدیران  <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> می‌توانند در Place پست بگدارند.",
      "Only Managers can post messages to this Place.": "فقط مدیران می توانند در این Place پست بگذارند.",
      "Only Managers of ...": "فقط مدیران ...",
      "Only Managers of {{ctlCreate.place.name}}": "فقط مدیران {{ctlCreate.place.name}}",
      "Only Members can post messages to <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> Place.": "فقط اعضا می‌توانند به Place  <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> پست بدهند.",
      "Only Members can view the contents of this Place": "فقط اعضا می‌توانند این Place را ببینند.",
      "Only Members of ...": "فقط اعضای ...",
      "Only Members of {{ctlCreate.place.name}}": "فقط اعضای {{ctlCreate.place.name}}",
      "Only Nested users can post messages to this Place.": "فقط کاربران نستد می‌توانند در این Place پست بگذارند.",
      "Only for Nested users": "فقط برای کاربران نستد",
      "Only you": "فقط شما",
      "Only you can view the contents of this Place.": "فقط شما می‌توانید این Place را ببینید.",
      "Only {{ ctlCreate.grandPlace.name }} Members can post messages to <b>{{ ctlCreate.place.name }}</b> Place.": "فقط اعضای {{ ctlCreate.grandPlace.name }} می‌توانند به Place <b>{{ ctlCreate.place.name }}</b>پست بدهند.",
      "Only {{ctlSettings.place.name}} Managers": "فقط مدیران {{ctlSettings.place.name}} ",
      "Only {{ctlSettings.place.name}} Members": "فقط اعضای {{ctlSettings.place.name}}",
      "Open Place": "Common Place",
      "Open in Browser": "بازکردن در مرورگر",
      "Other": "سایر",
      "Password": "رمز عبور",
      "Password is required": "نیاز به رمزعبور",
      "Password must be at least 6 character": "رمزعبور باید حداقل ۶ کاراکتر داشته باشد",
      "Pending ...": "تحت بررسی...",
      "Phone number": "شماره تلفن همراه",
      "Phone verification": "تایید شماره تلفن همراه",
      "Place ID": "شناسه Place",
      "Place Name": "نام Place",
      "Place Settings": "تنظیمات Place",
      "Place description": "توصیف فعالیت Place",
      "Place name": "نام Place",
      "Place name is required": "نیاز به نام Place",
      "Place {0} was removed successfully.": "Place {} با موفقیت حذف شد",
      "Please confirm you want to leave the page": "میخواهید از این صفحه خارج شوید؟",
      "Please make sure before doing this action.": "لطفاقبل از انجام عملیات مطمئن شوید.",
      "Please wait...": "لطفا صبرکنید...",
      "Privacy": "حریم شخصی",
      "Profile": "پروفایل",
      "Profile Settings": "تنظیمات پروفایل",
      "Promote": "ترفیع دادن",
      "Provided phone number is not valid": "شماره تلفن همراه معتبر نیست.",
      "Received Date": "تاریخ دریافت",
      "Recent Activities": "فعالیت‌های اخیر",
      "Recent Messages": "پست های اخیر",
      "Recover your Password": "بازیابی رمز عبور",
      "Recover your username": "بازیابی کلمه عبور",
      "Remove": "حذف",
      "Remove from favorite places": "حذف از علاقه مندی ها",
      "Reply all": "پاسخ به همه",
      "Reply to all": "پاسخ به همه ",
      "Reply to sender": "پاسخ به فرستنده",
      "Report a problem": "گزارش خطا",
      "Resend": "اشتراک گذاری مجدد",
      "Reset Password": "بازیابی رمز عبور",
      "Retract": "پس گرفتن",
      "Return": "بازگشت",
      "Retype your new password": "تکرار رمز عبور جدید",
      "Retype your new password.": "تکرار رمز عبور جدید.",
      "Roll up": "جمع کردن",
      "Save": "ذخیره",
      "Save & Exit": "ذخیره و خروج",
      "Search": "جستجو",
      "Search Places, users and messages...": "جستجوی Place،اعضا و پست‌ها...",
      "Search in {0}": "جستجو در  {0}",
      "Select a group of Members you would wish to be added to this Place": "انتخاب گروهی از اعضا برای اضافه کردن به Place.",
      "Select filter": "انتخاب فیلتر",
      "Select your country": "انتخاب کشور",
      "Send a feedback": "ارسال بازخورد",
      "Send to": "اشتراک گذاری",
      "Sequence dashes (--) are not allowed": "عدم پذیرش خط تیره متوالی (--).",
      "Share": "اشتراک‌گذاری",
      "Share With": "اشتراک گذاری با",
      "Shared by me": "اشتراک‌گذاشته‌های من",
      "Show in the search result of Members from {{ctlSettings.grandPlace.name}}?": "نمایش نتایج جستجوبرای اعضای {{ctlSettings.grandPlace.name}}?",
      "Show in the search results?": "نمایش در جستجو ",
      "Show less": "نمایش کمتر",
      "Show more...": "نمایش بیشتر...",
      "Sign in": "ورود",
      "Sign out": "خروج",
      "Size": "اندازه فایل ",
      "Sorry, An error has occured while configuring the place.": "خطا در ساخت Place.",
      "Sorry, An error has occured while creating the place.": "خطا در ساخت Place.",
      "Sorry, An error has occured while loading the older posts": "خطا در بارگزاری پست های قدیمی",
      "Sorry, an error has occured in sending your comment": "خطا در ثبت نظر ",
      "Sorry, an error has occured while checking your username.": "خطا در چک کردن نام کاربری",
      "Sorry, an error has occured while removing your comment": "خطا در حذف نظر ",
      "Sorry, an error has occurred in creating your account. Please contact us.": "خطا در ساخت حساب کاربری. لطفاً با ما تماس بگیرید.",
      "Sorry, an error has occurred in reseting your password.": "خطا در بازیابی رمز عبور.",
      "Sorry, an error has occurred in verifying the code.": "خطا در بررسی کد فعالسازی.",
      "Sorry, an error has occurred while loading the Place.": "خطا در بارگیری Place.",
      "Sorry, an error has occurred while updating your profile.": "خطا در به روز رسانی پروفایل.",
      "Sorry, an error occurred in viewing the files.": "خطا در نمایش فایل‌ها.",
      "Sorry, an unknown error has occurred.": "خطای ناشناخته.",
      "Sorry, but your 24-hour retraction time has come to its end.": "مهلت 24 ساعته بازگردانی به پایان رسیده.",
      "Sort by": "مرتب کردن",
      "Stay signed in": "ماندن در حساب کاربری",
      "Submitting...": "ارسال...",
      "Surname": "نام خانوادگی",
      "Surname is required": "نیاز به نام خانوادگی.",
      "That's not me!": "من نیستم!",
      "The Place photo has been set successfully.": "ثبت تصویر Place.",
      "The Place will be identified by this unique address. You <b>can't</b> change the Place ID after creating the Place, so choose wisely!": "نام منحصر به فرد شناسایی Place. امکان تغییر مجدد <b> وجود ندارد <b/>.",
      "The confirmation password you have entered is not long enough": "تایید رمز عبور کوتاه است.",
      "The message has been retracted successfully.": "جمع شدن پست.",
      "The new password you've chosen is not long enough": "رمز عبور کوتاه است.",
      "The old password you have entered is too long": "رمز عبور قدیمی طولانی ست.",
      "The old password you have entered is too short ": "رمز عبور قبلی کوتاه است.",
      "The old password you\\'ve entered is incorrect": "رمز عبور قدیمی شما اشتباه وارد شده.",
      "The post has been removed from Place {0}.": "پست ازPlace {0}حذف شد",
      "The provided email is not valid": "ایمیل معتبر نیست.",
      "The username is too long": "نام کاربری طولانی ست.",
      "The username is too short": "نام کاربری کوتاه است.",
      "There are no activities here! ": "فعالیتی وجود ندارد!",
      "There are no files here yet...": "فایلی وجود ندارد...",
      "There seems to be an error in reaching information from the highest-ranking Place.": "خطا در دریافت اطلاعات.",
      "This phonenumber is already used.": "این شماره در حال استفاده است.",
      "This username is already taken.": "این نام کاربری قبلاً ثبت شده است.",
      "To confirm and proceed with deleting this Place, please type below the Place ID:": "برای تایید حذف Place شناسه‌ی زیر را وارد نمایید.",
      "To create an account with Nested, please enter your phone number.": "وارد کردن شماره تلفن همراه.",
      "To proceed into your account, choose a new password.": "انتخاب رمز عبور جدید.",
      "To recover your Nested account password, please enter your phone number.": "برای بازیابی رمز عبور حساب کاربری نستد،لطفا شماره همراه را وارد کنید.",
      "To recover your Nested account username, please enter your phone number.": "برای بازیابی حساب کاربری نستد،لطفا شماره همراه را وارد کنید.",
      "Today": "امروز",
      "Total unseen posts": "پست خوانده نشده",
      "Try again!": "مجدد امتحان کنید!",
      "Try again...": "مجدد امتحان کنید...",
      "Turn Notifications on for this Place.": "فعال سازی اعلان.",
      "Turn notification off": "خاموش کردن اعلان",
      "Turn notification on": "روشن کردن اعلان",
      "User \"{0}\" has been previously added to Place \"{1}\".": "کاربر\"{0}\" بهPlace\" {1}\" قبلا اضافه شده.",
      "User \"{0}\" has been previously invited to Place \"{1}\".": "کاربر\"{0}\" بهPlace \" {1}\"قبلا دعوت شده.",
      "User \"{0}\" is the only Manager of this Place!": "کاربر \"{0}\" تنها مدیر این Place است .",
      "User \"{0}\" was added to Place \"{1}\" successfully.": "کاربر \"{0}\" با موفقیت به Place، \"{1}\" اضافه شد.",
      "User \"{0}\" was invited to Place \"{1}\" successfully.": "کاربر \"{0}\" با موفقیت به این Place \"{1}\"دعوت شد.",
      "Username": "نام کاربری",
      "Username is not valid": "نام کاربری معتبر نیست",
      "Username is required": "نام کاربری ضروری است.",
      "Verification code has been sent again.": "کد امنیتی مجدد ارسال شد",
      "Verifing...": "در حال بررسی...",
      "Verify": "بررسی",
      "View Settings": "تنظیمات ",
      "View older comments...": "نمایش نظرات قدیمی تر",
      "We are calling you now!": "منتظر تماس ما باشید!",
      "We've found an account already registered with your phone number. If you've forgotten your password, try to recover it or contact us for help.": "قبلا نام  کاربری با شماره شما ثبت شده ، یافته ایم.درصورت فراموشی رمز عبور خود اقدام به بازیابی آن کنید یا  با ما تماس بگیرید.",
      "We've sent a verification code via SMS to": "کدامنیتی برای شما  پیامک شد.",
      "Which Members can contribute to this Place?": "کدام اعضا می توانند در این Place مشارکت داشته باشند؟",
      "Which Members can post messages to this Place?": "چه کسی می توانند به این Place پست بگذارد؟",
      "Who can add Members to this Place?": "چه کسی می تواند اعضا را به این Place اضافه کند؟",
      "Who can create a sub-Place?": "چه کسی می تواندزیر مجموعه برای Place  بسازد ؟",
      "Who can invite Members to this Place?": "چه کسی می‌تواند اعضا را به این Place‌دعوت کند؟",
      "Who can invite new Members?": "چه کسی می تواند اعضای جدید را دعوت کند؟",
      "Who can post messages to this Place?": "چه کسی می‌تواند در این Place پست بگذارد؟",
      "Yes": "بله",
      "Yesterday": "دیروز",
      "You accepted this invitation.": "پذیرفتن دعوت",
      "You are not allowed to leave the Place because you are the creator of its highest-ranking Place ({0}).": "به دلیل اینکه تنها مدیر place  ({0})هستید وامکان ترک آن را ندارید.",
      "You are not allowed to remove \"{0}\", because he/she is the creator of its highest-ranking Place ({1}).": "شما مجاز به پاک کردن  \"{0}\" نیستید، زیرا مدیر Place  ({1})شخص دیگری است.",
      "You are the only one left!": "به دلیل اینکه شما آخرین عضو اینجا هستید، باید Place را حذف کنید!",
      "You can add multiple Members simultaneously": "افزودن چند عضو به‌طور همزمان",
      "You can not use this 'Place ID'.": "شما امکان استفاده از این شناسه Place  را ندارید",
      "You can't create any additional Places.": "عدم امکان ساخت Place دیگر",
      "You declined this invitation.": "عدم پذیرش دعوت",
      "You don't have any unread messages.": "پست نخوانده‌ای ندارید .",
      "You don't have the required access to enter this Place!": " عدم مجوز ورود به Place !",
      "You have to delete all the sub-Places within, before removing this Place.": "برای پاک کردن این Place، ابتدا تمامی Place های زیر مجموعه را پاک کنید.\r\n",
      "You haven't favorited any Places yet...": " هیچ Place ای در علاقمندی‌ها وجود ندارد...",
      "You'll lose any unsaved changes you've made if you choose to leave": "در صورت عدم ذخیره، تمامی تغییرات از بین میروند.",
      "You're disconnected from the server,": "ارتباط شما از سرور قطع شد",
      "You've been invited to": "شما  دعوت شدید به ",
      "You've changed your password successfully.": "رمز عبور شما با موفقیت تغییر کرد.",
      "You've entered a wrong code": "کد امنیتی وارد شده اشتباه است",
      "You've reached the end of your Activities! ": " به پایان فعالیت ها رسیدید!",
      "You\\'ve changed your password successfully.": "رمز عبور شما با موفقیت تغییر کرد.",
      "Your confirmation password should match your new password ": " رمز عبور خود را مجدد وارد کنید.",
      "Your message has been successfully sent.": "پست شما با موفقیت ارسال شد.",
      "Your message hasn\\'t been successfully sent to {0}": "پست شما به {0}با موفقیت ارسال شد/نشد.",
      "Your new password must be between 6 and 26 characters.": "رمز عبور جدید شما باید بین 6-26 کاراکتر باشد.",
      "Your profile has been updated.": "پروفایل شما به روزرسانی شد",
      "Your username is:": "نام کاربری شما:",
      "all": "همه موارد",
      "alphanumeric and dash(-) only": "فقط الفبا و خط تیره (-) ",
      "and": "و",
      "audios": "صوتی",
      "available": "در دسترس",
      "by {0}": "توسط {0}",
      "change": "تغییر ",
      "checking...": "در حال بررسی...",
      "commented on your post": "روی پست نظر گذاشت",
      "commented on:": "نظر: ",
      "comments {{ctlPostCard.post.commentsCount | localize}}": "{{ctlPostCard.post.commentsCount | localize}} نظر",
      "created\n          <a class=\"place\" ui-sref=\"app.place-activity({placeId: act.place.id})\">\n            {{::act.place.name}}\n          </a>\n        ": "ساخت<a class=\"place\" ui-sref=\"app.place-activity({placeId: act.place.id})\"> {{::act.place.name}} </a>\r\n\r\n\r\n\r\n",
      "created here": "اینجا را ساخت",
      "created {{::act.place.name}}": " {{::act.place.name}} را ساخت",
      "day": "روز",
      "documents": "اسناد",
      "dot(.) is not allowed": "(.) معتبر نیست",
      "images": "تصاویر",
      "invited": "دعوت شد",
      "john-doe": "john-smith",
      "john.doe@comapny.com": "john.smith@comapny.com",
      "joined here": "به اینجا پیوست",
      "joined {{::act.place.name}}": "به {{::act.place.name}}  پیوست",
      "left <a class=\"place\" ui-sref=\"app.place-activity({placeId : act.place.id})\">{{act.place.name}}</a>": "ترک <a class=\"place\" ui-sref=\"app.place-activity({placeId : act.place.id})\">{{act.place.name}}</a>",
      "left here": "ترک کرد",
      "left {{::act.place.name}}": "{{::act.place.name}} را ترک کرد",
      "month": "ماه",
      "new comments {{ctlPostCard.unreadCommentsCount}}": "{{ctlPostCard.unreadCommentsCount}}نظر جدید",
      "one Unseen": "یک پست نخوانده",
      "or": "یا ",
      "others": "سایر",
      "removed @{{::act.member.id}} from here": "حذف @{{::act.member.id}}از اینجا",
      "removed @{{::act.member.id}} from {{::act.place.name}}": "حذف @{{::act.member.id}} از {{::act.place.name}}",
      "removed {{::act.member.fullName}} from <a class=\"place\" ui-sref=\"app.place-activity({placeId : act.place.id})\">{{act.place.name}}</a>": "حذف {{::act.member.fullName}} از <a class=\"place\" ui-sref=\"app.place-activity({placeId : act.place.id})\">{{act.place.name}}</a>",
      "removed {{::act.member.fullName}} from here": "حذف  {{::act.member.fullName}} از اینجا",
      "shared in One place": "در یک Place به اشتراک گذاشته شده",
      "shared in {{cnt | localize}} places": "در {{cnt | localize}} Place به اشتراک گذاشته شده",
      "try again": "تلاش مجدد",
      "try now": "تلاش مجدد",
      "unavailable": "غیرقابل دسترسی",
      "used": "استفاده شده",
      "videos": "ویدئو‌ها",
      "we'll retry in {{ctrl.nextRetryTime}} second(s).": "{{ctrl.nextRetryTime}}  ثانیه دیگر مجدد تلاش میکنیم.",
      "write your comment...": "نظر خود را بنویسید...",
      "year": "سال",
      "{0} User(s) has not been added to Place {1}.": "کاربر{0} به ‌Place  {1} اضافه نشده",
      "{0} User(s) has not been invited to Place {1}.": "کاربر{0} به ‌Place  {1} دعوت نشده",
      "{0} user has been {1} to Place \"{2}\" successfully.": "کاربری به Place \"{2}\" {1}نشده ",
      "{0} user/s has been {1} to Place \"{2}\" successfully.": " {0}کاربر به Place  \"{2}\" {1}شده ",
      "{0} user/s has not been added to Place {1}.": "کاربر/کاربران {0} به ‌Place {1} اضافه نشده",
      "{0} user/s has not been invited to Place {1}.": "کاربر/کاربران {0} به ‌Place  {1} اضافه نشده",
      "{{ctlCreate.grandPlace.name}} Members": "اعضای {{ctlCreate.grandPlace.name}}",
      "{{ctlFullNavbar.place.name}} total unseen posts": "{{ctlFullNavbar.place.name}} مجموع پست‌های خوانده نشده",
      "{{ctlMessages.currentPlace.counters.posts | localize}} posts": "{{ctlMessages.currentPlace.counters.posts | localize}} پست",
      "{{ctlMessages.unreadCount | localize}} Unseen": "{{ctlMessages.unreadCount | localize}} خوانده نشده",
      "{{ctlPostCard.unreadCommentsCount | localize}} new comments": "{{ctlPostCard.unreadCommentsCount | localize}} نظر جدید",
      "{{ctlSettings.grandPlace.name}} Members": "اعضای {{ctlSettings.grandPlace.name}} ",
      "{{ctlTeammates.place.getTeammatesCount() | localize }} Members": "{{ctlTeammates.place.getTeammatesCount() | localize }} عضو"
    });
})();
