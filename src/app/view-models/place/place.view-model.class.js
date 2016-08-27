(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstVmPlace', NstVmPlace);
  // TODO: Why a view-model injects $state!!??
  function NstVmPlace($state, NstTinyPlace, NstPlace) {
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

      if (placeModel instanceof NstTinyPlace || placeModel instanceof NstPlace) {
        this.id = placeModel.getId();
        this.name = placeModel.getName();
        this.url = $state.href(getPlaceFilteredState(), { placeId: placeModel.getId() });
        this.avatar = placeModel.getPicture().getId() ? placeModel.getPicture().getThumbnail(32).getUrl().view : '/assets/icons/absents_place.svg';

        if (placeModel instanceof NstPlace) {
          for (var k in placeModel.getChildren()) {
            if ('length' !== k) {
              this.children.push(new VmPlace(placeModel.getChildren()[k], this.depth + 1));
            }
          }
        }
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
