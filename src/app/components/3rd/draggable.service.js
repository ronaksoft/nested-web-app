(function() {
  'use strict';
  angular
    .module('draggable', [])
    .service('Draggable', Draggable );
  function Draggable() {
    return window.Draggable;
  }
})();
