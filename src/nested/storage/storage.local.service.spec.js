describe('NstLocalStorage', function () {
  var localStorage,
      storageKeySeparator,
      NstLocalStorage = null;
  beforeEach(module('ronak.nested.web.common.cache'));
  beforeEach(inject(function ($window, _NstLocalStorage_, _storageKeySeparator_) {
    NstLocalStorage = _NstLocalStorage_;
    localStorage = $window.localStorage;
    storageKeySeparator = _storageKeySeparator_;
  }));

  describe('set(key, value[, serializer])',function () {
    var sandbox = null;
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    it('should set a key with provided value', function () {
      var spy = sandbox.spy();
      localStorage.setItem = spy;
      new NstLocalStorage('blah').set('foo', 1);
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'foo');
    });

    it('should use the provided serializer instead of the embeded one', function () {
      var serialize = function (text) {
        return '{' + text + '}';
      };

      var expected = serialize('haha');
      var spy = sandbox.spy();
      localStorage.setItem = spy;
      new NstLocalStorage('blah').set('foo', 'haha', serialize);
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'foo', expected);
      expect()
    });

    it('should remove the key', function () {
      var spy = sandbox.spy();
      localStorage.removeItem = spy;
      new NstLocalStorage('blah').remove('goo');
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
    });

    it('should get the stored value', function () {
      var spy = sandbox.spy();
      localStorage.getItem = spy;
      new NstLocalStorage('blah').get('goo');
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
    });

    afterEach(function () {
      sandbox.restore();
    });
  });

});
