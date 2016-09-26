describe('NstMemoryStorage', function () {
  var fooCache,
      memoryStorage,
      sandbox = null;
  beforeEach(module('ronak.nested.web.common.cache'));
  beforeEach(inject(function (_$cacheFactory_, _NstMemoryStorage_) {
    fooCache = _$cacheFactory_('foo');
    memoryStorage = new _NstMemoryStorage_('bar');
    memoryStorage.cache = fooCache;
  }));
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  describe('get(key)', function () {

    it('should get the stored value', function () {
      var spy = sandbox.spy();
      fooCache.get = spy;
      memoryStorage.get('blah');
      expect(spy).to.have.been.calledWith('blah');
    });

  });

  describe('set(key, value)',function () {

    it('should set a key with provided value', function () {
      var spy = sandbox.spy();
      fooCache.put = spy;
      memoryStorage.set('blah', { bar : 1 });
      expect(spy).to.have.been.calledWith('blah', { bar : 1 });
    });

  });

  describe('remove(key)', function () {

    it('should remove the key', function () {
      var spy = sandbox.spy();
      fooCache.remove = spy;
      fooCache.remove('blah');
      expect(spy).to.have.been.calledWith('blah');
    });

  });

  afterEach(function () {
    sandbox.restore();
  });

});
