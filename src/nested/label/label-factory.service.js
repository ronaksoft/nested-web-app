(function () {
  'use strict';

  angular
    .module('ronak.nested.web.label')
    .service('NstSvcLabelFactory', NstSvcLabelFactory);

  /** @ngInject */
  function NstSvcLabelFactory($q,
    NstBaseFactory, NstSvcServer, NstSvcUserFactory,
    NstLabel, NstLabelRequest,
    NST_LABEL_SEARCH_FILTER) {

    function LabelFactory() {
    }

    LabelFactory.prototype = new NstBaseFactory();
    LabelFactory.prototype.constructor = LabelFactory;

    LabelFactory.prototype.parse = function (data) {
      var model = new NstLabel();

      if (data && data._id) {
        model.id = data._id;
        model.title = data.title;
        model.code = data.code;
        model.public = data.public;
        model.topMembers = _.map(data.top_members, function (member) {
          return NstSvcUserFactory.parseTinyUser(member);
        });
        model.counters = data.counters;
      }

      return model;
    };

    LabelFactory.prototype.parseRequest = function (data) {
      var model = new NstLabelRequest();

      if (data && data._id) {
        model.id = data._id;
        model.label = (data.label ? this.parse(data.label) : null);
        model.user =  NstSvcUserFactory.parseTinyUser(data.user);
        model.title = data.title;
        model.code = data.code;
      }

      return model;
    };

    LabelFactory.prototype.create = function (title, code, isPublic) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/create', {
          title: title,
          code: code,
          is_public: isPublic,
        }).then(function (result) {
          var label = new NstLabel();

          label.id = result.label_id;
          label.title = title;
          label.code = code;
          label.isPublic = isPublic;

          return $q.resolve(label);
        });
      }, 'create-' + title);
    };

    LabelFactory.prototype.update = function (id, title, code) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/update', {
          label_id: id,
          title: title,
          code: code,
        });
      }, 'update-' + id);
    };

    LabelFactory.prototype.remove = function (id) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/remove', {
          label_id: id,
        });
      }, 'remove-' + id);
    };

    LabelFactory.prototype.search = function (keyword, filter, skip, limit) {
      var that = this;
      return this.sentinel.watch(function () {
        return NstSvcServer.request('search/labels', {
          keyword: keyword,
          filter: filter || NST_LABEL_SEARCH_FILTER.ALL,
          skip: skip || 0,
          limit: limit || 10,
          details: true,
        }).then(function (result) {
          return $q.resolve(_.map(result.labels, that.parse));
        });
      }, 'search');
    };

    LabelFactory.prototype.getRequest = function (skip, limit) {
      var that = this;
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/get_requests', {
          skip: skip || 0,
          limit: limit || 10
        }).then(function (result) {
          return $q.resolve(_.map(result.label_requests, that.parseRequest));
        });
      }, 'get-request');
    };

    LabelFactory.prototype.request = function (id, title, code) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/request', {
          label_id: id,
          title: title,
          code: code,
        });
      }, 'request-' + (id || title));
    };

    LabelFactory.prototype.updateRequest = function (id, status) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/request_update', {
          request_id: id,
          status: status,
        });
      }, 'request-update' + id + status);
    };

    LabelFactory.prototype.cancelRequest = function (id) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/remove_request', {
          request_id: id,
        });
      }, 'remove_request' + id + status);
    };

    LabelFactory.prototype.addMember = function (labelId, accountId) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/add_member', {
          label_id: labelId,
          account_id: accountId,
        });
      }, 'addMember-' + labelId + '-' + accountId);
    };

    LabelFactory.prototype.removeMember = function (labelId, accountId) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/remove_member', {
          label_id: labelId,
          account_id: accountId,
        });
      }, 'removeMember-' + labelId + '-' + accountId);
    };

    return new LabelFactory();
  }
})();
