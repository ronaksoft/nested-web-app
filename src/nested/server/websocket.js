// (function () {
//   'use strict';
//   angular
//     .module('ronak.nested.web.data')
//     .factory('NstWebSocket', NstWebSocket);
//
//   /**@Inject */
//   function NstWebSocket(NstObject) {
//
//     /**
//      *
//      * @param url
//      * @param protocol
//      */
//     function ws(url, protocol) {
//
//       /**
//        * URL of web socket server
//        *
//        */
//       this.url = url;
//
//
//       this.protocol = protocol;
//
//       this._onOpenCallBacks = [];
//       this._onMessageCallBacks = [];
//       this._onErrorCallBacks = [];
//       this._onCloseCallBacks = [];
//
//       NstObject.call(this);
//
//     }
//
//     ws.prototype.onOpen = function onOpen(callback) {
//       this._onOpenCallBacks.push(callback);
//     };
//
//     ws.prototype._onOpenHandler = function _onOpenHandler() {
//       for (var i = this._onOpenCallBacks.length - 1; i >= 0; i--) {
//         this._onOpenCallBacks[i].call();
//       }
//     };
//
//
//     ws.prototype.onError = function onError(callback) {
//       this._onErrorCallBacks.push(callback);
//     };
//
//     ws.prototype._onErrorHandler = function _onErrorHandler(error) {
//       for (var i = this._onErrorCallBacks.length - 1; i >= 0; i--) {
//         this._onErrorCallBacks[i].call(error);
//       }
//     };
//
//     ws.prototype.onClose = function onClose(callback) {
//       this._onCloseCallBacks.push(callback);
//     };
//
//     ws.prototype._onCloseHandler = function _onCloseHandler(reason) {
//       for (var i = this._onCloseCallBacks.length - 1; i >= 0; i--) {
//         this._onCloseCallBacks[i].call(reason);
//       }
//     };
//
//     ws.prototype.onMessage = function onMessage(callback) {
//       this._onMessageCallBacks.push(callback)
//     };
//
//     ws.prototype._onMessageHandler = function _onMessageHandler(callback) {
//       this._onMessageCallBacks.push(callback)
//     };
//
//
//     ws.prototype.close = function close() {
//       this._stream.close();
//     };
//
//     ws.prototype.reconnect = function connect(delay) {
//       var _self = this;
//
//       //ToDo:: Read default delay from config
//       delay = delay || 2000;
//
//
//       this.close();
//       setTimeout(function () {
//         _self.open();
//       }, delay)
//
//     };
//
//     ws.prototype.send = function (message) {
//       this._stream.send(message);
//     };
//
//     ws.prototype.open = function () {
//       this._stream = new WebSocket(this.url, this.protocol);
//       this._stream.onopen = this._onOpenHandler;
//       this._stream.onclose = this._onCloseHandler;
//       this._stream.onerror = this._onErrorHandler;
//       this._stream.onmessage = this._onMessageHandler;
//     };
//
//
//   }
//
//
// })
