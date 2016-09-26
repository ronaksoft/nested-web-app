describe('NstSessionStorage', function() {
  var sessionStorage,
    storageKeySeparator,
    NstSessionStorage,
    sandbox = null;
  beforeEach(module('ronak.nested.web.common.cache'));
  beforeEach(inject(function($window, _NstSessionStorage_, _storageKeySeparator_) {
    NstSessionStorage = _NstSessionStorage_;
    sessionStorage = $window.sessionStorage;
    storageKeySeparator = _storageKeySeparator_;
  }));

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  describe('set(key, value[, serializer])', function() {

    it('should set a key with provided value', function() {
      var spy = sandbox.spy();
      sessionStorage.setItem = spy;
      new NstSessionStorage('blah').set('foo', 1);
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'foo');
    });

    it('should use the provided serializer instead of the embeded one', function() {
      var serialize = function(text) {
        return '{' + text + '}';
      };

      var expected = serialize('haha');
      var spy = sandbox.spy();
      sessionStorage.setItem = spy;
      new NstSessionStorage('blah').set('foo', 'haha', serialize);
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'foo', expected);
    });

  });

  describe('remove(key)', function() {

    it('should remove the key', function() {
      var spy = sandbox.spy();
      sessionStorage.removeItem = spy;
      new NstSessionStorage('blah').remove('goo');
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
    });

  });
  describe('get(key[, serializer])', function() {

    it('should get the stored value', function() {
      var spy = sandbox.spy();
      sessionStorage.getItem = spy;
      new NstSessionStorage('blah').get('goo');
      expect(spy).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
    });

    it('should get the value and deserialize it with provided serializer', function () {
      var value = '**haha**';
      var deserialize = function (text) {
        return text.replace(/[*]/g,'');
      };
      var stub = sandbox.stub().returns(value);
      sessionStorage.getItem = stub;
      var result = new NstSessionStorage('blah').get('goo', deserialize);
      expect(stub).to.have.been.calledWith('blah' + storageKeySeparator + 'goo');
      expect(result).to.equal(deserialize(value));
    });

  });


  afterEach(function() {
    sandbox.restore();
  });

});
