var assert = require('assert'),
  tmpResult;

module.exports = function () {

  this.setDefaultTimeout(600 * 1000);

  this.Given(/^I go on the page "([^"]*)"$/, function (url) {
    browser.get(browser.baseUrl + url);
  });

  this.When(/^I wait$/, function() {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    browser.wait(EC.visibilityOf(element(By.css('.loading-container'))), 10000);

  });

  this.When(/^Wait to loading hide$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.loading-container'))), 50000);
  });

  this.Given(/^Wait to see the "([^"]*)" title$/, function (title) {
    browser.ignoreSynchronization = true;
    return browser.wait(function () {
        return element(By.css('.nst-font-xlarge')).isDisplayed() &&
          element(By.css('.nst-font-xlarge')).getText().then(function(txt){
            return txt.trim() == title.trim();
          })
    },20000)
  });

  this.Given(/^I fill "([^"]*)" with "([^"]*)"$/, function (placeholder, value) {
    var input = element(By.css('input[placeholder="' + placeholder +'"]'));
    input.sendKeys(value);
  });

  this.Given(/^I Press "([^"]*)"$/, function (value) {
    var button = element(By.css("*[value='" + value + "']"));
    button.click();
  });


  this.Then(/^should the title of the page be "([^"]*)"$/, function (expectedTitle) {
      return browser.getTitle().then(function (title) {
        assert.equal(title, expectedTitle, ' title is "' + title + '" but should be "' + expectedTitle);
      });
  });

  this.Then(/^should the title of the place be "([^"]*)"$/, function (expectedTitle) {
    element(By.css(".navbar-top .name")).getText().then(function (title) {
      assert.equal(title.trim(), expectedTitle, ' title is "' + title + '" but should be "' + expectedTitle);
    });
  });

};
