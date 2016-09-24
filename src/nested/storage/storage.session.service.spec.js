describe('NstSessionStorage', function () {
  var sessionStorage,
      storageKeySeparator,
      NstSessionStorage = null;
  beforeEach(module('ronak.nested.web.common.cache'));
  beforeEach(inject(function ($window, _NstSessionStorage_, _storageKeySeparator_) {
    NstSessionStorage = _NstSessionStorage_;
    sessionStorage = $window.sessionStorage;
    storageKeySeparator = _storageKeySeparator_;
  }));

  describe('set(key, value[, serializer])',function () {
    var sandbox = null;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    it('should set a key with provided value', function () {
      var spy = sandbox.spy();
      sessionStorage.setItem = spy;
      new NstSessionStorage('blah').set('foo', 1);
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'foo');
    });

    it('should use the provided serializer instead of the embeded one', function () {
      var serialize = function (text) {
        return '{' + text + '}';
      };

      var expected = serialize('haha');
      var spy = sandbox.spy();
      sessionStorage.setItem = spy;
      new NstSessionStorage('blah').set('foo', 'haha', serialize);
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'foo', expected);
    });

    it('should remove the key', function () {
      var spy = sandbox.spy();
      sessionStorage.removeItem = spy;
      new NstSessionStorage('blah').remove('goo');
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
    });

    it('should get the stored value', function () {
      var spy = sandbox.spy();
      sessionStorage.getItem = spy;
      new NstSessionStorage('blah').get('goo');
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
    });

    afterEach(function () {
      sandbox.restore();
    });
  });


});
