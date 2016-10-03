describe('NstBaseFactory', function () {
  var NstBaseFactory,
      sandbox = null;
  beforeEach(module('ronak.nested.web.common'));
  beforeEach(inject(function (_NstBaseFactory_) {
    NstBaseFactory = _NstBaseFactory_;
  }));
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  describe('sentinel', function () {
    it('should return the the provided callback for the first time', function () {
      var baseFactory = new NstBaseFactory();
      var callback = function get() {
        return $q(function (resolve, reject) {
          resolve('1');
        });
      };
      baseFactory.sentinel.watch('foo', callback).then(function (result) {
        console.log('result', result);
      });
      expect(true).to.equal(false);
    });
  });

  afterEach(function() {
    sandbox.restore();
  });
});
