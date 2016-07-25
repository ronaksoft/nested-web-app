(function () {
  'use strict';

  angular
    .module('nested')
    .factory('NstVmNavbarControl', NstVmNavbarControl);

  function NstVmNavbarControl($state) {
    /**
     * Creates an instance of NstVmPlace
     *
     * @param {String}    caption Control Caption
     * @param {String}    type    Control Style Type (Appearance)
     * @param {String}    url     Control URL
     * @param {Function}  fn      Control Click Callback Function
     * @param {Function}  data    Control Meta Data
     *
     * @constructor
     */
    function VmNavbarControl(caption, type, url, fn, data) {
      this.caption = caption || '';
      this.type = type || NST_NAVBAR_CONTROL_TYPE.BUTTON;
      this.fn = fn || function () {};
      this.url = url || $state.href($state.current.name);
      this.data = data || {};

      console.log('The Function: ', fn);
    }

    return VmNavbarControl;
  }
})();
