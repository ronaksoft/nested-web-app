// (function (angular) {
//   "use strict";
//   angular.module("ronak.nested.web.components")
//     .constant("VIEW", {
//       MOBILE: "mobile",
//       TABLET: "tablet",
//       DESKTOP: "desktop"
//     })
//     .factory("deviceDetector", function ($window, VIEW, $rootScope) {
//         var deviceInfo,win=angular.element($window);
//
//         function checkVIEW() {
//           if ($window.innerWidth  > 990 ) {
//
//             $rootScope.deviceDetector = VIEW.DESKTOP
//           } else {
//             $rootScope.deviceDetector = VIEW.TABLET
//           }
//         }
//
//         checkVIEW();
//
//         win.on("resize", function () {
//           checkVIEW();
//         });
//
//         return $rootScope.deviceDetector;
//       }
//     )
// })(angular);
