describe('NstUtilString', function () {
  var NstUtilString = null;
  beforeEach(module('ronak.nested.web.components.utility'));
  beforeEach(inject(function (_NstUtilString_) {
    NstUtilString = _NstUtilString_;
  }));

  describe('format(text [,arguments])', function () {
    it('should return the same text if any parameter is not provided', function () {
      var text = "Hello {0}";
      var result = NstUtilString.format(text);

      expect(result).to.be.equal(text);
    });

    it('should replace all occurrence', function () {
      var text = "Welcome {0}, What do you want {0}?";
      var result = NstUtilString.format(text, "John");
      var expected = "Welcome John, What do you want John?";

      expect(result).to.be.equal(expected);
    });

    it('should skip extra parameters', function () {
      var text = "Welcome {0}, What do you want {1}?";
      var result = NstUtilString.format(text, "John", "Brad", "Mike", "Tom", "Todd");
      var expected = "Welcome John, What do you want Brad?";

      expect(result).to.be.equal(expected);
    });

    it('should replace items of an array', function () {
      var text = "Welcome {0}, What do you want {1}?";
      var result = NstUtilString.format(text, ["John", "Fred"]);
      var expected = "Welcome John, What do you want Fred?";

      expect(result).to.be.equal(expected);
    });

    it('should not replace blocks with wrong index', function () {
      var text = "Welcome {0}, What do you want {3}?";
      var result = NstUtilString.format(text, ["John", "Fred"]);
      var expected = "Welcome John, What do you want {3}?";

      expect(result).to.be.equal(expected);
    });
  });

});
