(function() {
  'use strict';
  angular
    .module('ronak.nested.web.place')
    .service('NstSvcPlaceMap', NstSvcPlaceMap);

  /** @ngInject */
  function NstSvcPlaceMap() {

    var service = {
      toTree: toTree
    };

    return service;

    function toTree(places) {

      var parentsStack = [];

      var setSuperUserLevel = function (subPlace) {
        var id = subPlace._id;
        subPlace.children =  [];

        for (var i = parentsStack.length -1 ; i > -1; i--) {
          if (id.indexOf(parentsStack[i]) === 0){
            subPlace.level =  i + 1;
            subPlace.parent = parentsStack[i]
            return subPlace;
          }else{
            parentsStack = _.dropRight(parentsStack)
          }
        }
        subPlace.level =  0;
        return subPlace;
      };

      var setLevel = function (subPlace){
        subPlace = setSuperUserLevel(subPlace);
        parentsStack.push(subPlace._id);
      };


      var breedPlaces = function(places){
        var tree = [];
        for (var i = places.length - 1; i > -1 ; i--) {
          if (places[i].level === 0){
            tree.unshift(places[i]);
          }else{

            places.filter(function(place){
              return place._id === places[i].parent;
            })[0].children.unshift(places[i]);

          }
          _.drop(places);
        }
        return tree;
      };


      var sorteedPlaces = _.sortBy(places,['_id']);

      _.forEach(sorteedPlaces, setLevel);

      console.log(3333, breedPlaces(sorteedPlaces));
      return breedPlaces(sorteedPlaces);

    }




  }

})();
