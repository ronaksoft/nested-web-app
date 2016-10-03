// (function() {
//   'use strict';
//   angular
//     .module('ronak.nested.web.place')
//     .service('NstSvcPlaceMap', NstSvcPlaceMap);
//
//   /** @ngInject */
//   function NstSvcPlaceMap() {
//
//     var service = {
//       toSidebarSubPlace : toSidebarSubPlace
//     };
//
//     return service;
//
//     function toSidebarSubPlace(grandPlace, places) {
//       if (!place || !place.id) {
//         throw 'The grand-place is not provided';
//       }
//
//       if (!(_.isArray(places) && places.length > 0)) {
//         return [];
//       }
//       var children = _.filter(places, function (place) {
//         return _.startsWith(place.id, grandPlace.id);
//       });
//
//       createMap(grandPlace, children);
//     }
//
//     function createTree(place, places) {
//       place.children
//       var placeGroups = _.groupBy(places, function (place) {
//         return _.
//       });
//     }
//
//   }
//
// })();
