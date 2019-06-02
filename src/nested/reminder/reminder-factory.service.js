(function () {
  'use strict';

  angular
    .module('ronak.nested.web.task')
    .service('NstSvcReminderFactory', NstSvcReminderFactory);

  function NstSvcReminderFactory($q, _,
                              NstBaseFactory, NstSvcServer, NstSvcUserFactory, NstCollector, NstSvcGlobalCache,
                              NstReminder, NstReminderRequest, NST_SRV_ERROR, NST_REMINDER_REPEAT_CASE, moment) {

    function ReminderFactory() {
      this.collector = new NstCollector('reminder', this.getMany);
      this.cache = NstSvcGlobalCache.createProvider('reminder');
    }

    ReminderFactory.prototype = new NstBaseFactory();
    ReminderFactory.prototype.constructor = ReminderFactory;
    ReminderFactory.prototype.parseReminder = parseReminder;
    ReminderFactory.prototype.parseReminderRequest = parseReminderRequest;
    ReminderFactory.prototype.createRequestObject = createRequestObject;
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
      model.timestamp = _.map(String(data.timestamp).split(','), function(ts) {return ts ? parseInt(ts): null});
      model.interval = data.interval;
      model.days = _.map(String(data.days).split(','), function(day) {return day ? parseInt(day): null});
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

    function createRequestObject(reminder) {
      var timestamp = reminder.timestamp[0];
      if (reminder.days && Array.isArray(reminder.days) && reminder.days.length > 0) {
        var weekday = moment(timestamp).weekday();
        var substract = weekday === 7 ? -1 : (weekday === 6 ? 0 : -1 * weekday);
        reminder.timestamp = _.map(reminder.days, function (day){
          return parseInt(moment(timestamp).subtract(substract, 'days').add(day, 'day').format('x'));
        });
      }
      reminder.timestamp = Array.isArray(reminder.timestamp) ? reminder.timestamp.join(',') : reminder.timestamp
      reminder.days = Array.isArray(reminder.days) ? reminder.days.join(',') : reminder.days
      delete reminder.repeat_case
      return reminder;
    }

    function create(taskId, repeated, relative, timestamp, interval, days) {
      var factory = this;
      return NstSvcServer.request('task/add_reminder', {
        task_id: taskId,
        repeated: repeated,
        relative: relative,
        timestamp: timestamp,
        interval: interval,
        days: days
      }).then(function (result) {
        var reminders = result.reminders;
        return $q.resolve(Array.isArray(reminders) ?_.map(reminders, factory.parseReminder): factory.parseReminder(reminders));
      }).catch(function() {
        return $q.reject()
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
