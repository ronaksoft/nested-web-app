(function () {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstVmPlace', NstVmPlace);
  // TODO: Why a view-model injects $state!!??
  function NstVmPlace($state, NstTinyPlace, NstPlace, NST_STORE_ROUTE) {
    /**
     * Creates an instance of NstVmPlace
     *
     * @param {NstTinyPlace|NstPlace} placeModel The Place Model
     *
     * @constructor
     */
    function VmPlace(placeModel, depth) {

      this.id = '';
      this.name = '';
      this.url = '';
      this.avatar = '';
      this.depth = depth || 0;
      this.children = [];
      this.unreadPosts = 0;
      this.totalPosts = 0;
      this.teammatesCount = 0;
      this.isStarred = false;

      if (placeModel instanceof NstTinyPlace || placeModel instanceof NstPlace) {

        this.id = placeModel.id;
        this.name = placeModel.name;
        this.url = $state.href(getPlaceFilteredState(), { placeId: placeModel.id });
        this.avatar = placeModel.hasPicture() ? placeModel.picture.getUrl("x64") : '/assets/icons/absents_place.svg';
        this.unreadPosts = placeModel.unreadPosts;
        this.totalPosts = placeModel.counters ? placeModel.counters.posts : null;
        this.teammatesCount = placeModel.counters ? placeModel.counters.creators + placeModel.counters.key_holders : null;
      }
    }
    // TODO: It should not be here!!!
    function getPlaceFilteredState() {
      var state = 'place-messages';

      if ($state.current.name.indexOf('activity') > -1) {
        state = 'place-activity';
      // } else if ($state.current.name.indexOf('compose') > -1) {
      //   state = 'place-compose';
      } else if ($state.current.name.indexOf('settings') > -1) {
        state = 'place-settings';
      }

      return state;
    }

    return VmPlace;
  }
})();
