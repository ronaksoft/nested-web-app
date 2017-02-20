[1mdiff --git a/src/app/components/navbar/full/full-navbar.controller.js b/src/app/components/navbar/full/full-navbar.controller.js[m
[1mindex c877334..0d89399 100644[m
[1m--- a/src/app/components/navbar/full/full-navbar.controller.js[m
[1m+++ b/src/app/components/navbar/full/full-navbar.controller.js[m
[36m@@ -42,19 +42,10 @@[m
     vm.isPersonal = isPersonal;[m
     vm.isSubPersonal = isSubPersonal;[m
     vm.confirmToLeave = confirmToLeave;[m
[31m-    vm.toggleFeed = toggleFeed;[m
     vm.isFeed = $state.current.options.feed;[m
     vm.isFavPlaces = $state.current.options.favoritePlace;[m
     vm.searchKeyPressed = searchKeyPressed;[m
 [m
[31m-    function toggleFeed(isFavPlaces) {[m
[31m-      if (isFavPlaces) {[m
[31m-        $state.go('app.messages-favorites');[m
[31m-      } else {[m
[31m-        $state.go('app.messages');[m
[31m-      }[m
[31m-    }[m
[31m-[m
     function isUnread() {[m
       if ($state.current.name == 'app.place-messages-unread' ||[m
         $state.current.name == 'app.place-messages-unread-sorted') {[m
[36m@@ -204,7 +195,7 @@[m
       if (hasPlace()) {[m
         return $state.href('app.place-messages', {placeId: vm.getPlaceId()});[m
       } else {[m
[31m-        return $state.href('app.messages');[m
[32m+[m[32m        return $state.href('app.messages-favorites');[m
       }[m
     }[m
 [m
[1mdiff --git a/src/app/components/navbar/mini/mini-navbar.controller.js b/src/app/components/navbar/mini/mini-navbar.controller.js[m
[1mindex 40a4c40..8c159b2 100644[m
[1m--- a/src/app/components/navbar/mini/mini-navbar.controller.js[m
[1m+++ b/src/app/components/navbar/mini/mini-navbar.controller.js[m
[36m@@ -126,7 +126,7 @@[m
      *****************************/[m
 [m
     function getUnfilteredState() {[m
[31m-      var state = 'app.messages';[m
[32m+[m[32m      var state = 'app.messages-favorites';[m
       switch ($state.current.name) {[m
         case 'app.activity':[m
         case 'app.activity-favorites':[m
[1mdiff --git a/src/app/components/sidebar/sidebar.controller.js b/src/app/components/sidebar/sidebar.controller.js[m
[1mindex d6d0ebf..8bd94de 100644[m
[1m--- a/src/app/components/sidebar/sidebar.controller.js[m
[1m+++ b/src/app/components/sidebar/sidebar.controller.js[m
[36m@@ -305,7 +305,7 @@[m
     // TODO: Move these to Common Service[m
 [m
     function getUnfilteredState() {[m
[31m-      var state = 'app.messages';[m
[32m+[m[32m      var state = 'app.messages-favorites';[m
       // switch ($state.current.options.group) {[m
       //   case 'activity':[m
       //     state = 'app.activity';[m
[1mdiff --git a/src/app/index.const.js b/src/app/index.const.js[m
[1mindex 06f4cf5..cc17507 100644[m
[1m--- a/src/app/index.const.js[m
[1m+++ b/src/app/index.const.js[m
[36m@@ -5,7 +5,7 @@[m
   angular[m
     .module('ronak.nested.web.main')[m
     .constant('NST_DEFAULT', {[m
[31m-      STATE: 'app.messages',[m
[32m+[m[32m      STATE: 'app.messages-favorites',[m
       STATE_PARAM: '_'[m
     })[m
     .constant('NST_PUBLIC_STATE', [[m
