(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcReminderFactory', NstSvcReminderFactory);

  function NstSvcReminderFactory($q, _,
                              NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache,
                              NstReminder, NstReminderRequest, NST_SRV_ERROR, NST_REMINDER_REPEAT_CASE) {

    function ReminderFactory() {
      this.collector = new NstCollector('reminder', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('reminder');
    }

    ReminderFactory.prototype = new NstBaseFactory();
    ReminderFactory.prototype.constructor = ReminderFactory;
    ReminderFactory.prototype.parseReminder = parseReminder;
    ReminderFactory.prototype.parseReminderRequest = parseReminderRequest;
    ReminderFactory.prototype.parseMember = parseMember;
    ReminderFactory.prototype.create = create;
    ReminderFactory.prototype.update = update;
    ReminderFactory.prototype.remove = remove;
    ReminderFactory.prototype.getCachedSync = getCachedSync;
    ReminderFactory.prototype.get = get;
    ReminderFactory.prototype.set = set;
    ReminderFactory.prototype.transformToCacheModel = transformToCacheModel;

    function parseReminder(data) {
      if (!(data && data._id)) {
        return null;
      }

      var model = new NstReminder();
      model.id = data._id;
      model.repeated = data.repeated;
      model.relative = data.relative;
      model.timestamp = data.timestamp;
      model.interval = data.interval;
      model.days = data.days;
      model.repeat_case = data.interval % 7 * 24 * 60 * 60 * 1000 === 0 ? NST_REMINDER_REPEAT_CASE.WEEKS : NST_REMINDER_REPEAT_CASE.DAYS;
      // model.days = _.map(data.days, function (member) {
      //   NstSvcUserFactory.set(member);
      //   return NstSvcUserFactory.parseTinyUser(member);
      // });

      return model;
    }

    function parseReminderRequest(data) {
      var model = new NstReminderRequest();
      if (data && data._id) {
        model.id = data._id;
        if (data.reminder) {
          model.reminder = data.reminder;
        } else {
          delete model.reminder;
        }
        model.user = NstSvcUserFactory.parseTinyUser(data.requester);
        NstSvcUserFactory.set(data.requester);
      }

      return model;
    }

    function parseMember(data) {
      return NstSvcUserFactory.parseTinyUser(data)
    }

    function create(task_id, repeated, relative, timestamp, interval, days) {
      var factory = this;
      return NstSvcServer.request('task/add_reminder', {
        task_id: task_id,
        repeated: repeated,
        relative: relative,
        timestamp: timestamp,
        interval: interval,
        days: days
      }).then(function (result) {

        return $q.resolve(factory.parseReminder(result));
      });
    }

    function update(id, task_id, repeated, relative, timestamp, interval, days) {
      return NstSvcServer.request('task/update_reminder', {
        reminder_id: id,
        task_id: task_id,
        repeated: repeated,
        relative: relative,
        timestamp: timestamp,
        interval: interval,
        days: days
      });
    }

    function remove(id, task_id) {
      return NstSvcServer.request('task/remove_reminder', {
        reminder_id: id,
        task_id: task_id
      });
    }

    
    function getCachedSync(id) {
      return this.parseReminder(this.cache.get(id));
    }

    function get(id) {
      var factory = this;

      var cachedReminder = this.getCachedSync(id);
      if (cachedReminder) {
        return $q.resolve(cachedReminder);
      }

      var deferred = $q.defer();

      this.collector.add(id).then(function (data) {
        factory.set(data);
        deferred.resolve(factory.parseReminder(data));
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

    function transformToCacheModel(data) {
      var cacheModel = _.clone(data);

      return cacheModel;
    }

    return new ReminderFactory();
  }
})();
