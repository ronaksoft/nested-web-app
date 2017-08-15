describe('NstBaseFactory', function () {
  var sandbox = null;
  beforeEach(module('ronak.nested.web.common'));
  beforeEach(inject(function (_NstBaseFactory_, _$q_) {
    NstBaseFactory = _NstBaseFactory_;
    $q = _$q_;
  }));
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });
});
