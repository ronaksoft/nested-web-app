(function () {
  'use strict';

  angular
    .module('ronak.nested.web.label')
    .service('NstSvcLabelFactory', NstSvcLabelFactory);

  /** @ngInject */
  function NstSvcLabelFactory($q, _,
                              NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache,
                              NstLabel, NstLabelRequest,
                              NST_LABEL_SEARCH_FILTER, NST_SRV_ERROR) {

    function LabelFactory() {
      this.collector = new NstCollector('label', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('label');
    }

    LabelFactory.prototype = new NstBaseFactory();
    LabelFactory.prototype.constructor = LabelFactory;
    LabelFactory.prototype.parseLabel = parseLabel;
    LabelFactory.prototype.request = request;
    LabelFactory.prototype.parseLabelRequest = parseLabelRequest;
    LabelFactory.prototype.parseMember = parseMember;
    LabelFactory.prototype.create = create;
    LabelFactory.prototype.update = update;
    LabelFactory.prototype.remove = remove;
    LabelFactory.prototype.search = search;
    LabelFactory.prototype.getRequests = getRequests;
    LabelFactory.prototype.updateRequest = updateRequest;
    LabelFactory.prototype.cancelRequest = cancelRequest;
    LabelFactory.prototype.getMembers = getMembers;
    LabelFactory.prototype.addMember = addMember;
    LabelFactory.prototype.removeMember = removeMember;
    LabelFactory.prototype.getMany = getMany;
    LabelFactory.prototype.getCachedSync = getCachedSync;
    LabelFactory.prototype.get = get;
    LabelFactory.prototype.set = set;
    LabelFactory.prototype.parseCacheModel = parseCacheModel;
    LabelFactory.prototype.transformToCacheModel = transformToCacheModel;

    function parseLabel(data) {
      if (!(data && data._id)) {
        return null;
      }

      var model = new NstLabel();
      model.id = data._id;
      model.title = data.title;
      model.code = data.code;
      model.public = data.public;
      model.topMembers = _.map(data.top_members, function (member) {
        NstSvcUserFactory.set(member);
        return NstSvcUserFactory.parseTinyUser(member);
      });
      model.counters = data.counters;
      model.isMember = data.is_member;

      return model;
    }

    function parseLabelRequest(data) {
      var model = new NstLabelRequest();
      if (data && data._id) {
        model.id = data._id;
        if (data.label) {
          model.label = data.label;
        } else {
          delete model.label;
        }
        model.user = NstSvcUserFactory.parseTinyUser(data.requester);
        NstSvcUserFactory.set(data.requester);
        model.title = data.title;
        model.code = data.code;
      }

      return model;
    }

    function parseMember(data) {
      return NstSvcUserFactory.parseTinyUser(data)
    }

    function create(title, code, isPublic) {
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
    }

    function update(id, title, code) {
      return NstSvcServer.request('label/update', {
        label_id: id,
        title: title,
        code: code
      });
    }

    function remove(id) {
      return NstSvcServer.request('label/remove', {
        label_id: id
      });
    }

    function search(keyword, filter, skip, limit, cacheHandler) {
      var that = this;
      return NstSvcServer.request('search/labels', {
        keyword: keyword,
        filter: filter || NST_LABEL_SEARCH_FILTER.ALL,
        skip: skip || 0,
        limit: limit || 10,
        details: true
      }, function (cachedResponse) {
        if (cachedResponse && _.isFunction(cacheHandler)) {
          var labels = _.reduce(cachedResponse.labels, function (list, label) {
            var cachedLabel = that.getCachedSync(label._id);
            if (cachedLabel) {
              list.push(cachedLabel);
            }

            return list;
          }, []);
          cacheHandler(labels);
        }
      }).then(function (result) {
        var labels = _.map(result.labels, function (item) {
          that.set(item);
          return that.parseLabel(item);
        });

        return $q.resolve(labels);
      });
    }

    function getRequests(skip, limit) {
      var that = this;
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/get_requests', {
          skip: skip || 0,
          limit: limit || 10
        }).then(function (result) {
          return $q.resolve(_.map(result.label_requests, that.parseLabelRequest));
        });
      }, 'label-get-request');
    }

    function request(id, title, code) {
      if(id) {
        return NstSvcServer.request('label/request', {
          label_id: id,
          title: title,
          code: code
        });
      } else {
        return NstSvcServer.request('label/request', {
          title: title,
          code: code
        });
      }
    }

    function updateRequest(id, status) {
      return NstSvcServer.request('label/update_request', {
        request_id: id,
        status: status
      });
    }

    function cancelRequest(id) {
      return NstSvcServer.request('label/remove_request', {
        request_id: id
      });
    }

    function getMembers(labelId, skip, limit) {
      var that = this;
      return this.sentinel.watch(function () {
        return NstSvcServer.request('label/get_members', {
          label_id: labelId,
          skip: skip || 0,
          limit: limit || 10
        }).then(function (result) {
          return $q.resolve(_.map(result.members, that.parseMember));
        });
      }, 'label-get-member-' + labelId);
    }

    function addMember(labelId, accountId) {
      return NstSvcServer.request('label/add_member', {
        label_id: labelId,
        account_id: accountId
      });
    }

    function removeMember(labelId, accountId) {
      return NstSvcServer.request('label/remove_member', {
        label_id: labelId,
        account_id: accountId
      });
    }

    function getMany(ids) {
      var defer = $q.defer();
      var joinedIds = ids.join(',');
      if (!joinedIds) {
        defer.reject(null);
      } else {
        NstSvcServer.request('label/get_many', {
          label_id: joinedIds
        }).then(function (data) {

          var not_access = _.differenceWith(ids, data.labels, function (i, b) {
            return i === b._id;
          });

          defer.resolve({
            idKey: '_id',
            resolves: data.labels,
            rejects: not_access
          });
        }).catch(defer.reject);
      }
      return defer.promise;
    }

    function getCachedSync(id) {
      return this.parseCacheModel(this.cache.get(id));
    }

    function get(id) {
      var factory = this;

      var cachedLabel = this.getCachedSync(id);
      if (cachedLabel) {
        return $q.resolve(cachedLabel);
      }

      var deferred = $q.defer();

      this.collector.add(id).then(function (data) {
        factory.set(data);
        deferred.resolve(factory.parseLabel(data));
      }).catch(function (error) {
        switch (error.code) {
          case NST_SRV_ERROR.ACCESS_DENIED:
          case NST_SRV_ERROR.UNAVAILABLE:
            factory.cache.remove(id);
            break;
        }

        deferred.reject(error);
      });

      return deferred.promise;
    }

    function set(data) {
      if (data && data._id) {
        this.cache.set(data._id, this.transformToCacheModel(data));
      } else {
        // console.error('The data is not valid to be cached!', data);
      }
    }

    function parseCacheModel(data) {
      if (!(data && data._id)) {
        return null;
      }

      var model = new NstLabel();

      if (data && data._id) {
        model.id = data._id;
        model.title = data.title;
        model.code = data.code;
        model.public = data.public;
        model.topMembers = _.map(data.top_members, function (memberId) {
          return NstSvcUserFactory.getCachedSync(memberId);
        });
        model.counters = data.counters;
        model.isMember = data.is_member;
      }

      return model;
    }

    function transformToCacheModel(data) {
      var cacheModel = _.clone(data);
      cacheModel.top_members = _.map(data.top_members, '_id');

      return cacheModel;
    }

    return new LabelFactory();
  }
})();
