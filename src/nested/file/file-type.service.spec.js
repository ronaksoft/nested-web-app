describe("NstSvcFileType", function () {
  var NstSvcFileType = null,
      fileTypeGroupProvider = null,
      sandbox = null;
  beforeEach(module('ronak.nested.web.file'));
  beforeEach(module('ronak.nested.web.common'));
  beforeEach(inject(function (_NstSvcFileType_) {
    NstSvcFileType = _NstSvcFileType_;
    // fileTypeGroupProvider = _fileTypeGroupProvider_;
    // console.log(fileTypeGroupProvider);
  }));
  // beforeEach(function () {
  //   sandbox = sinon.sandbox.create();
  // });

  describe("getSuffix(fileName)", function () {

    it('should return an empty string if the provided fileName does not have extension', function () {
      var result = NstSvcFileType.getSuffix("foo");
      expect(result).to.be.empty;
    });

    it('should return an empty string if the provided fileName ends with an dot', function () {
      var result = NstSvcFileType.getSuffix("foo.");
      expect(result).to.be.empty;
    });

    it('should return the file extension', function () {
      var result = NstSvcFileType.getSuffix("foo.goo");
      var expected = "goo";
      expect(result).to.be.equal(expected);
    });

  });

  describe("removeSuffix(fileName)", function () {

    it("should return the same fileName if it does not contain suffix", function () {
      var fileName = "something";
      var result = NstSvcFileType.removeSuffix(fileName);
      expect(result).to.be.equal(fileName);
    });

    it("should return the file name without dot and extension", function () {
      var fileName = "something.foo";
      var expected = "something";
      var result = NstSvcFileType.removeSuffix(fileName);
      expect(result).to.be.equal(expected);
    });

    it("should just return the last trailing part of fileName which assumed to be the real file-extension", function () {
      var fileName = "something.foo.goo.voo";
      var expected = "something.foo.goo";
      var result = NstSvcFileType.removeSuffix(fileName);
      expect(result).to.be.equal(expected);
    });

  });

  describe("getType(mimeType)", function () {
    it("should return null if the provided mimeType does not belong to any of file types", function () {

    });
  });

  // afterEach(function () {
  //   sandbox.restore();
  // });

});
