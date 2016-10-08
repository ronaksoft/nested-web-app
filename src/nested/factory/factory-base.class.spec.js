describe('NstBaseFactory', function () {
  var NstBaseFactory,
      $q,
      sandbox = null;
  beforeEach(module('ronak.nested.web.common'));
  beforeEach(inject(function (_NstBaseFactory_, _$q_) {
    NstBaseFactory = _NstBaseFactory_;
    $q = _$q_;
  }));
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  // describe('sentinel', function () {
  //   it('call the callback', function (done) {
  //     var baseFactory = new NstBaseFactory();
  //     var callback = sandbox.stub().returns($q(function (resolve, reject) {
  //       resolve(2);
  //       console.log('foo');
  //     }));
  //     baseFactory.sentinel.watch('bar', callback).should.be.fulfilled;
  //   });
  // });
  // describe('sentinel', function () {
  //   it('should resolve the provided value', function () {
  //     var baseFactory = new NstBaseFactory();
  //     var callback = function get() {
  //       return $q.resolve('1');
  //     };
  //     baseFactory.sentinel.watch('bar', callback).then(function (result) {
  //       expect(result).to.equal('1');
  //     });
  //   });
  // });
  // describe('sentinel', function () {
  //   it('should reject with the provided value', function () {
  //     var baseFactory = new NstBaseFactory();
  //     var callback = function get() {
  //       return $q.reject('1');
  //     };
  //     baseFactory.sentinel.watch('bar', callback).then(function (result) {
  //       console.log(result);
  //       expect(result).to.equal('1');
  //     });
  //   });
  // });

  afterEach(function() {
    sandbox.restore();
  });
});
