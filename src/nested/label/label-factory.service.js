(function () {
  'use strict';

  angular
    .module('ronak.nested.web.label')
    .service('NstSvcLabelFactory', NstSvcLabelFactory);

  /** @ngInject */
  function NstSvcLabelFactory($q,
    NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector,
    NstLabel, NstLabelRequest,
    NST_LABEL_SEARCH_FILTER, _) {

    function LabelFactory() {
      this.collector = new NstCollector('label', this.getMany);
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
        model.isMember = data.is_member;
      }

      return model;
    };

    LabelFactory.prototype.parseRequest = function (data) {
      var model = new NstLabelRequest();
      if (data && data._id) {
        model.id = data._id;
        if (data.label) {
          model.label = data.label;
        } else {
          delete model.label;
        }
        model.user =  NstSvcUserFactory.parseTinyUser(data.requester);
        model.title = data.title;
        model.code = data.code;
      }

      return model;
    };

    LabelFactory.prototype.parseMember = function (data) {
      return NstSvcUserFactory.parseTinyUser(data)
    };

    LabelFactory.prototype.create = function (title, code, isPublic) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/create', {
          title: title,
          code: code,
          is_public: isPublic
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
          code: code
        });
      }, 'update-' + id);
    };

    LabelFactory.prototype.remove = function (id) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/remove', {
          label_id: id
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
          details: true
        }).then(function (result) {
          return $q.resolve(_.map(result.labels, that.parse));
        });
      }, 'search');
    };

    LabelFactory.prototype.getRequests = function (skip, limit) {
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
          code: code
        });
      }, 'request-' + (id || title));
    };

    LabelFactory.prototype.updateRequest = function (id, status) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/update_request', {
          request_id: id,
          status: status
        });
      }, 'request-update' + id + status);
    };

    LabelFactory.prototype.cancelRequest = function (id) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/remove_request', {
          request_id: id
        });
      }, 'remove-request' + id + status);
    };

    LabelFactory.prototype.getMembers = function (labelId, skip, limit) {
      var that= this;
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/get_members', {
          label_id: labelId,
          skip: skip || 0,
          limit: limit || 10
        }).then(function (result) {
          return $q.resolve(_.map(result.members, that.parseMember));
        });
      }, 'get-member-' + labelId);
    };

    LabelFactory.prototype.addMember = function (labelId, accountId) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/add_member', {
          label_id: labelId,
          account_id: accountId
        });
      }, 'add-member-' + labelId + '-' + accountId);
    };

    LabelFactory.prototype.removeMember = function (labelId, accountId) {
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/remove_member', {
          label_id: labelId,
          account_id: accountId
        });
      }, 'remove-member-' + labelId + '-' + accountId);
    };

    LabelFactory.prototype.getMany = function (id) {
      var defer = $q.defer();
      var joinedIds = id.join(',');
      if (!joinedIds) {
        defer.reject(null);
      } else {
        return NstSvcServer.request('label/get_many', {
          label_id: joinedIds
        }).then(function (data) {
          defer.resolve({
            idKey: '_id',
            resolves: data.labels,
            rejects: data.no_access
          });
        }).catch(defer.reject);
      }
    };

    LabelFactory.prototype.get = function (id) {
      var deferred = $q.defer();
      var factory = this;
      console.log(factory.collector.getList());
      this.collector.add(id).then(function (data) {
        var label = factory.parse(data);
        deferred.resolve(label);
      }).catch(function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
      // var factory = this;
      // return this.sentinel.watch(function () {
      //   return NstSvcServer.request('label/get_many', {
      //     label_id: id
      //   }).then(function (result) {
      //     return $q.resolve(factory.parse(result.labels[0]));
      //   }).catch(function () {
      //     return null;
      //   });
      // }, 'get-label-' + id);
    };

    return new LabelFactory();
  }
})();
