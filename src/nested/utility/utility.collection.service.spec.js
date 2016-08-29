describe('NstUtilCollection', function() {
  var NstUtilCollection = null;
  beforeEach(module('nested'));
  beforeEach(inject(function(_NstUtilCollection_) {
    NstUtilCollection = _NstUtilCollection_;
  }));

  describe('dropById()', function() {
    it('should return the same collection if could not find the item with the specified Id', function() {
      var collection = [{
        id: 'a'
      }, {
        id: 'b'
      }, {
        id: 'c'
      }];

      var id = 'a';
      NstUtilCollection.dropById(collection, id);
      expect(collection).to.have.lengthOf(2);
    });
  });
});
