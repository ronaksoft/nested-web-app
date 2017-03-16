describe('NstUtilCollection', function() {
  var NstUtilCollection = null;
  beforeEach(module('ronak.nested.web.components.utility'));
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

      var id = 'x';
      var result = NstUtilCollection.dropById(collection, id);
      expect(result).to.have.lengthOf(3);
    });
  });

  describe('dropById()', function() {
    it('should return the same collection if could not find property \"id\" inside objects', function() {
      var collection = [{
        name: 'a'
      }, {
        name: 'b'
      }, {
        name: 'c'
      }];

      var id = 'a';
      var result = NstUtilCollection.dropById(collection, id);
      expect(result).to.have.lengthOf(3);
    });
  });

  describe('dropById()', function() {
    it('should remove an item with specified id and return the modified collection.', function() {
      var collection = [{
        id: 'a'
      }, {
        id: 'b'
      }, {
        id: 'c'
      }];

      var id = 'a';
      var result = NstUtilCollection.dropById(collection, id);
      expect(result).to.have.lengthOf(2);
    });
  });

  describe('dropById()', function() {
    it('should mutate the collection itself.', function() {
      var collection = [{
        id: 'a'
      }, {
        id: 'b'
      }, {
        id: 'c'
      }];

      var id = 'a';
      var result = NstUtilCollection.dropById(collection, id);
      expect(result).to.equal(collection);
    });
  });

});
