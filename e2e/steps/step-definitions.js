// var assert = require('assert'),
//   tmpResult;
//
// module.exports = function () {
//
//   this.setDefaultTimeout(600 * 1000);
//
//   this.Given(/^I go to the page "([^"]*)"$/, function (url) {
//     browser.get(browser.baseUrl + url);
//   });
//
//   this.When(/^I wait 10s$/, function () {
//     browser.ignoreSynchronization = true;
//     return browser.sleep(10000);
//
//   });
//
//   this.When(/^I wait 5s$/, function () {
//     browser.ignoreSynchronization = true;
//     return browser.sleep(5000);
//
//   });
//
//   this.When(/^I wait 2s$/, function () {
//     browser.ignoreSynchronization = true;
//     return browser.sleep(2000);
//
//   });
//
//   this.When(/^Wait to loading hide$/, function () {
//     browser.ignoreSynchronization = true;
//     var EC = protractor.ExpectedConditions;
//     return browser.wait(EC.invisibilityOf(element(By.css('.loading-container'))), 50000);
//   });
//
//   this.When(/^I Wait till line loader hide$/, function () {
//     element(By.css('div[style="width: 0%;"]'));
//     return;
//   });
//
//   this.Given(/^Wait to see the "([^"]*)" title$/, function (title) {
//     browser.ignoreSynchronization = true;
//     return browser.wait(function () {
//       return element(By.css('.nst-font-xlarge')).isDisplayed() &&
//         element(By.css('.nst-font-xlarge')).getText().then(function (txt) {
//           return txt.trim() == title.trim();
//         })
//     }, 20000)
//   });
//
//   this.Given(/^I fill "([^"]*)" with "([^"]*)"$/, function (placeholder, value) {
//     var input = element(By.css('input[placeholder="' + placeholder + '"]'));
//     input.sendKeys(value);
//   });
//
//   this.Given(/^I fill id "([^"]*)" with "([^"]*)"$/, function (id,value) {
//     var input = element(By.css('#'+ id));
//     input.sendKeys(value);
//   });
//
//   this.Given(/^I Press "([^"]*)"$/, function (value) {
//     var button = element(By.css('input[value="' + value + '"]'));
//     button.click();
//   });
//
//   this.Given(/^I Click id "([^"]*)"$/, function (id) {
//     var radiob = element(By.css('#' + id));
//     radiob.click();
//   });
//
//   this.Given(/^I Click Dropdown by Placeholder "([^"]*)"$/, function (placeholder) {
//     var dropdown = element(By.css('select[placeholder="' + placeholder + '"]'));
//     dropdown.click();
//   });
//
//   this.Given(/^I Click Option by Label "([^"]*)"$/, function (label) {
//     var option = element(By.css('option[label="' + label + '"]'));
//     option.click();
//   });
//
//   this.Given(/^I Click label by for "([^"]*)"$/, function (itsFor) {
//     var checkbox = element(By.css('label[for="' + itsFor + '"]'));
//     checkbox.click();
//   });
//
//   this.Given(/^I Click Link by Partial Text "([^"]*)"$/, function (partial) {
//     var linkText = element(By.partialLinkText(partial));
//     linkText.click();
//   });

  // this.Given(/^I Click Sidebar Place Name "([^"]*)"$/, function (sidebarPlaceName) {
  //   var sidebarList = browser.findElement(by.className('side-place-item-inner'));
  //   expect(sidebarList.getText()).toBe(sidebarPlaceName);
  //   sidebarList.click();
  // });

  // this.Given(/^I Click Place Badge of Postcards "([^"]*)"$/, function (placeBadge) {
  //   var postcardPlaceBadge = browser.findElement(by.className('margin-r-5'));
  //   expect(postcardPlaceBadge.getText()).toBe(placeBadge);
  //   postcardPlaceBadge.click();
  // });

  // this.Given(/^I Click Search Button$/, function () {
  //   element(By.css('div[style="max-width: 0px;"]'));
  //   return;
  // });


  // this.Then(/^should the title of the page be "([^"]*)"$/, function (expectedPageTitle) {
  //   return browser.getTitle().then(function (title) {
  //     assert.equal(title, expectedPageTitle, ' title is "' + title + '" but should be "' + expectedPageTitle);
  //   });
  // });
  //
  // this.Then(/^should the title of the place be "([^"]*)"$/, function (expectedPlaceTitle) {
  //   element(By.css(".navbar-top .name")).getText().then(function (title) {
  //     assert.equal(title.trim(), expectedPlaceTitle, ' title is "' + title + '" but should be "' + expectedPlaceTitle);
  //   });
  // });
  //
  // this.Then(/^should the title be "([^"]*)"$/, function (expectedTitle) {
  //   element(by.css('.testing-title')).getText().then(function (title) {
  //     assert.equal(title.trim(), expectedTitle, ' title is "' + title + '" but should be "' + expectedTitle);
  //   });
  // });
  //
  //
  // this.Then(/^should the title1 be "([^"]*)"$/, function (expectedTitle1) {
  //   element(by.css('.testing-title1')).getText().then(function (title) {
  //     assert.equal(title.trim(), expectedTitle1, ' title is "' + title + '" but should be "' + expectedTitle1);
  //   });
  // });
  //
  // this.Then(/^should see "([^"]*)" error message$/, function (expectedError) {
  //   return element(By.css(".testing_err")).getText().then(function (error) {
  //     return assert.equal(error.trim(), expectedError, ' error is "' + error + '" but should be "' + expectedError);
  //   }).catch(function () {
  //     return assert.ok(false, 'Can not find message!')
  //   });
  // });

};
