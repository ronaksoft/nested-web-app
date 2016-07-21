(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstVmPlace', NstVmPlace);

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
            this.children.push(new VmPlace(placeModel.getChildren()[k], this.depth + 1));
          }
        }
      }
    }

    function getPlaceFilteredState() {
      var state = 'place-messages';

      if ($state.current.name.indexOf('activity') > -1) {
        state = 'place-activity';
      }

      return state;
    }

    return VmPlace;
  }
})();
