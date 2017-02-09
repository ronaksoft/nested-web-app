(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .constant('NST_LOCALE_EN_US', {
      "<a>{{ ::notification.joined.sender.fullName }}</a><br>\n          <small>is now on nested</small>": "<a>{{ ::notification.joined.sender.fullName }}</a><br> <small> is now on Nested</small>",
      "Add a subject line...": "Subject ",
      "Add to favorite places": "Add to Feed Places",
      "Add to my Favorites": "Add to Feed",
      "All <b>{{ ctlCreate.grandPlace.name }}</b> Members can post messages to this Place.": "All <b>{{ ctlCreate.grandPlace.name }}</b> Members can share posts in this Place.",
      "All <b>{{ctlCreate.grandPlace.name}}</b> Members can view Place contents.": "All <b>{{ctlCreate.grandPlace.name}}</b> Members can view the contents of this Place",
      "All <b>{{ctlSettings.grandPlace.name}}</b> Members can post messages to this Place.": "All <b>{{ctlSettings.grandPlace.name}}</b> Members can share posts in this Place",
      "All Members can post messages to this Place.": "All Members can share posts in this Place.",
      "Alright": "Okay",
      "An error has occurred in removing this Place.": "An error has occurred while removing this Place.",
      "An error has occurred in sending a new verification code.": "An error has occurred while sending a new verification code.",
      "An error has occurred in the retraction of the message.": "An error has occurred while retracting the post.",
      "An error has occurred in trying to reach you via phone call.": "An error has occurred while trying to reach you via phone call.",
      "An error has occurred in trying to remove this message from the selected Place.": "An error has occurred while removing this post from the selected Place.",
      "An error has occurred in updating the Place photo.": "An error has occurred while updating the Place photo.",
      "An error occured while tying to show the post full body.": "An error has occurred while displaying the entire post. ",
      "Are you sure you want to delete post {0} from Place {1}?": "Are you sure you want to delete this post {0} from {1}?",
      "Are you sure you want to delete the post from Place {0}?": "Are you sure you want to delete this post from {0}?",
      "Are you sure you want to retract this message? This action will delete the message from all the recipients and cannot be undone.": "Are you sure you want to retract this post? This action will delete the post from all the recipients and cannot be undone.",
      "Back to the profile": "Back to profile",
      "Bookmarked": "Bookmarks",
      "By deleting place, you are agreeing to erase all Place data permanently. Are you sure you want to do this?": "By deleting this Place, you are agreeing to erase all the Place data permanently. Are you sure you want to do this?",
      "By discarding this message, you will lose your draft. Are you sure you want to discard?": "By discarding this post, you will lose your draft. Are you sure you want to discard?",
      "By proceeding to create a Nested account, you are agreeing to our <a href=\"https://help.nested.me/terms/index.html\" class=\"nst-mood-cheerful\">Terms and Conditions</a>.": "By proceeding to create a Nested account, you are agreeing to our <a href=\"https://help.nested.me/terms/index.html\" class=\"nst-mood-cheerful\">Terms</a>.",
      "Change place ID": "Change Place ID",
      "Choose your username:": "Choose your username",
      "Click here to load more messages": "Click here to load more posts",
      "Closed Place": "Private Place",
      "Conversation with:": "Conversations with",
      "Create a Closed Place": "Create a Private Place",
      "Create an Open Place": "Create a Common Place",
      "Date of Birth": "Date of birth",
      "Don\\'t end your username with a dash (-)": "You can't end your username with a dash (-)",
      "Don\\'t start your username with a number (0-9) or a dash (-)": "You can't start your username with a number (0-9) or a dash (-)",
      "Email": "Your email address",
      "Empty Message": "No Content",
      "Enter a Place name or a Nested address...": "Enter a Place or a Nested address...",
      "Enter your place ID": "Enter your Place ID",
      "Everyone can send their messages to <b>...</b> Place. This includes messages sent from different email platforms to your Nested address ({{(ctlCreate.placesParts ? ctlCreate.placesParts.join('.') + '.' : '') + (ctlCreate.place.id || '')}}@nested.me).": "Everyone can share posts with <b>...</b> Place. This includes posts and emails sent from other emailing services to your Nested address ({{(ctlCreate.placesParts ? ctlCreate.placesParts.join('.') + '.' : '') + (ctlCreate.place.id || '')}}@nested.me).",
      "Everyone can send their messages to <b>...</b> Place. This includes messages sent from email platforms to your Nested address ({{ctlSettings.place.id}}@nested.me).": "Everyone can share posts with <b>...</b> Place. This includes posts and emails sent from other emailing services to your Nested address ({{ctlSettings.place.id}}@nested.me).",
      "Everyone can send their messages to <b>{{ctlCreate.place.name}}</b> Place. This includes messages sent from different email platforms to your Nested address ({{(ctlCreate.placesParts ? ctlCreate.placesParts.join('.') + '.' : '') + (ctlCreate.place.id || '')}}@nested.me).": "Everyone can share posts with <b>{{ctlCreate.place.name}}</b> Place. This includes posts and emails sent from other emailing services to your Nested address ({{(ctlCreate.placesParts ? ctlCreate.placesParts.join('.') + '.' : '') + (ctlCreate.place.id || '')}}@nested.me).",
      "Everyone can send their messages to <b>{{ctlSettings.place.name}}</b> Place. This includes messages sent from email platforms to your Nested address ({{ctlSettings.place.id}}@nested.me).": "Everyone can share posts with <b>{{ctlSettings.place.name}}</b> Place. This includes posts and emails sent from other emailing services to your Nested address ({{ctlSettings.place.id}}@nested.me).",
      "Find files in this place": "Find files in this Place",
      "Help center": "Help Center",
      "Install apps": "Install the Nested app",
      "Invitation to {0}": "You're invited to {0}",
      "Invitation to {0} by {1}.": "You're invited to {0} by {1}.",
      "Invite new people by searching their name, entering their email, or phone number.": "Invite new people by typing their name, their email, or phone number.",
      "Logs": "Your logs ",
      "Message Sent": "Post shared",
      "Message didn\\'t send": "Post wasn't shared",
      "Message sent": "Post shared",
      "Messages": "Posts",
      "Mobile phone": "Phone number",
      "Name or ID...": "Name or Place ID...",
      "Name, email or phone number...": "Name, Place ID or Nested address... ",
      "New Password": "New password",
      "New message": "New post",
      "No access": "No Access",
      "No comments": "No Comments",
      "No more messages here!": "No more posts here!",
      "Old Password": "Old password",
      "One New Message": "One new post",
      "Only Managers can post messages to <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> Place.": "Only Managers can share posts with <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b>.",
      "Only Managers can post messages to this Place.": "Only Managers can share posts in this Place.",
      "Only Managers of ...": "Only Managers of...",
      "Only Members can post messages to <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b> Place.": "Only Members can share posts with <b>{{ctlCreate.place.name ? ctlCreate.place.name : '...'}}</b>.",
      "Only Members can view the contents of this Place": "Only Members can view the contents of this Place.",
      "Only {{ ctlCreate.grandPlace.name }} Members can post messages to <b>{{ ctlCreate.place.name }}</b> Place.": "Only {{ ctlCreate.grandPlace.name }} Members can share posts with <b>{{ ctlCreate.place.name }}</b>.",
      "Open Place": "Common Place",
      "Open in Browser": "Open in browser",
      "Password must be at least 6 character": "Your password must contain at least 6 characters.",
      "Pending ...": "Pending...",
      "Place Name": "Place name",
      "Place Settings": "Place settings",
      "Place {0} was removed successfully.": "{0} was removed successfully.",
      "Please confirm you want to leave the page": "You have unsaved changes! Are you sure you want to leave this page?",
      "Profile Settings": "Profile settings",
      "Received Date": "Date Received",
      "Recent Messages": "Recent Posts",
      "Recover your Password": " Recover your password",
      "Remove from favorite places": " Remove from Feed ",
      "Save & Exit": "Save and exit",
      "Search Places, users and messages...": "Search for users, Places, and content... ",
      "Select a group of Members you would wish to be added to this Place": "Select the Members you wish to add to this Place",
      "Select filter": "Customize",
      "Send": "Share",
      "Send a feedback": "Send feedback",
      "Send to": "Share with",
      "Share With": "Share with",
      "Show in the search result of Members from {{ctlSettings.grandPlace.name}}?": "Show in the search results of Members from {{ctlSettings.grandPlace.name}}?",
      "Show in the search results?": "Show in search results?",
      "Sorry, An error has occured while configuring the place.": "Sorry, an error has occurred while configuring the Place.",
      "Sorry, An error has occured while creating the place.": "Sorry, an error has occurred while creating the Place.",
      "Sorry, An error has occured while loading the older posts": "Sorry, an error has occurred while loading older posts.",
      "Sorry, an error has occured in sending your comment": "Sorry, an error has occurred while sharing your comment.",
      "Sorry, an error has occured while removing your comment": "Sorry, an error has occured while deleting your comment.",
      "Sorry, an error has occurred in creating your account. Please contact us.": "Sorry, an error has occurred while creating your account. Please contact us.",
      "Sorry, an error has occurred in reseting your password.": "Sorry, an error has occurred while reseting your password.",
      "Sorry, an error has occurred in verifying the code.": "Sorry, an error has occurred while verifying the code.",
      "Sorry, an error occurred in viewing the files.": "Sorry, an error occurred while displaying the files.",
      "Sorry, but your 24-hour retraction time has come to its end.": "Sorry, but your 24-hour retraction time has ended.",
      "The message has been retracted successfully.": "The post has been retracted successfully.",
      "The old password you\\'ve entered is incorrect": "The old password you've entered is incorrect",
      "The post has been removed from Place {0}.": "The post has been removed from {0}.",
      "The username is too long": "Username too long",
      "The username is too short": "Username too short",
      "There seems to be an error in reaching information from the highest-ranking Place.": "There seems to be an error in reaching information from the top-level Place.",
      "This phonenumber is already used.": "This phone number is already used.",
      "Try again...": "Try again!",
      "Turn Notifications on for this Place.": "Turn on notifications for this Place",
      "Turn notification off": "Turn notifications off",
      "Turn notification on": "Turn notifications on",
      "User \"{0}\" has been previously added to Place \"{1}\".": "\"{0}\" is already a Member of \"{1}\". ",
      "User \"{0}\" has been previously invited to Place \"{1}\".": "\"{0}\" has already been invited to \"{1}\".",
      "User \"{0}\" is the only Manager of this Place!": "\"{0}\" is the only Manager of this Place!",
      "User \"{0}\" was added to Place \"{1}\" successfully.": "\"{0}\" was added to \"{1}\" successfully.",
      "User \"{0}\" was invited to Place \"{1}\" successfully.": "\"{0}\" was invited to \"{1}\" successfully.",
      "Verifing...": "Verifying...",
      "View Settings": "View settings",
      "Which Members can contribute to this Place?": "Which Members can share posts in this Place? ",
      "Which Members can post messages to this Place?": "Which Members can share posts in this Place?",
      "Who can create a sub-Place?": "Who can create sub-Places?",
      "Who can post messages to this Place?": "Who can share posts with this Place?\r\n",
      "You are not allowed to leave the Place because you are the creator of its highest-ranking Place ({0}).": "You can't leave the Place because you are the Manager of its top-level Place ({0}).",
      "You are not allowed to remove \"{0}\", because he/she is the creator of its highest-ranking Place ({1}).": "You can't remove \"{0}\", because he/she is the Manager of its top-level Place ({1}).",
      "You can not use this 'Place ID'.": "You cannot use this Place ID.",
      "You don't have any unread messages.": "You don't have any unseen posts. ",
      "You have to delete all the sub-Places within, before removing this Place.": "You have to delete all the embedded sub-Places before being able to delete this Place.",
      "You\\'ve changed your password successfully.": "You've changed your password successfully.",
      "Your message has been successfully sent.": "Your post has been successfully shared.",
      "Your message hasn\\'t been successfully sent to {0}": "Wait, there is a problem with sharing of this post {0}. Please try again. ",
      "alphanumeric and dash(-) only": "alphanumeric and dash (-) only",
      "change": "Change",
      "checking...": "Checking...",
      "comments {{ctlPostCard.post.commentsCount}}": "{{ctlPostCard.post.commentsCount}} comments ",
      "created here": "created this",
      "documents": "Files",
      "dot(.) is not allowed": "You can't use a dot (.)",
      "images": "Photos",
      "invited": "Invited",
      "john-doe": "John Smith",
      "john.doe@comapny.com": "john.smith@company.com",
      "joined here": "has joined",
      "joined {{::act.place.name}}": "has joined {{::act.place.name}}",
      "left here": "has left",
      "left {{::act.place.name}}": "has left {{::act.place.name}}",
      "new comments {{ctlPostCard.unreadCommentsCount}}": "{{ctlPostCard.unreadCommentsCount}} new comments ",
      "one Unseen": "one unseen post",
      "removed {{::act.member.fullName}} from here": "{{::act.member.fullName}} has been removed from here",
      "try again": "Try again!",
      "try now": "Try now",
      "unavailable": "Unavailable",
      "used": "already used ",
      "videos": "Videos",
      "we'll retry in {{ctrl.nextRetryTime}} second(s).": "We'll retry in {{ctrl.nextRetryTime}} second(s).",
      "write your comment...": "Write your comment...",
      "{0} User(s) has not been added to Place {1}.": "{0} user(s) have not been added to Place {1}.",
      "{0} User(s) has not been invited to Place {1}.": "{0} user(s) have not been invited to Place {1}.",
      "{0} user has been {1} to Place \"{2}\" successfully.": "{0} user(s) have been {1} to \"{2}\" successfully.",
      "{0} user/s has been {1} to Place \"{2}\" successfully.": "{0} user(s) have been {1} to \"{2}\" successfully.",
      "{0} user/s has not been added to Place {1}.": "{0} user(s) have not been added to Place {1}.",
      "{0} user/s has not been invited to Place {1}.": "{0} user(s) have not been invited to Place {1}.",
      "{{ctlMessages.unreadCount}} Unseen": "{{ctlMessages.unreadCount}} unseen"
    });
})();
