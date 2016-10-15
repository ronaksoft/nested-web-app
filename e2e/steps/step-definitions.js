var assert = require('assert'),
  tmpResult;

module.exports = function () {

  this.setDefaultTimeout(600 * 1000);

  this.Given(/^I go to the page "([^"]*)"$/, function (url) {
    browser.get(browser.baseUrl + url);
  });
  // this.Given(/^I Click Place Badge of Postcards "([^"]*)"$/, function (placeBadge) {
  //   var postcardPlaceBadge = browser.findElement(by.className('margin-r-5'));
  //   expect(postcardPlaceBadge.getText()).toBe(placeBadge);
  //   postcardPlaceBadge.click();
  // });
  //
  // this.Given(/^I Click Search Button$/, function () {
  //   element(By.css('div[style="max-width: 0px;"]'));
  //   return;
  // });
  //

  this.When(/^I wait 10s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(10000);
  this.Then(/^should the title of the page be "([^"]*)"$/, function (expectedPageTitle) {
    return browser.getTitle().then(function (title) {
      assert.equal(title, expectedPageTitle, ' title is "' + title + '" but should be "' + expectedPageTitle);
    });
  });

  });

  this.When(/^I wait 5s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(5000);

  });

  this.When(/^I wait 2s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(2000);

  });

  this.When(/^Wait to loading hide$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.loading-container'))), 50000);
  });

  this.When(/^I Wait till line loader hide$/, function () {
    element(By.css('div[style="width: 0%;"]'));
    return;
  });

  this.Given(/^Wait to see the "([^"]*)" title$/, function (title) {
    browser.ignoreSynchronization = true;
    return browser.wait(function () {
      return element(By.css('.nst-font-xlarge')).isDisplayed() &&
        element(By.css('.nst-font-xlarge')).getText().then(function (txt) {
          return txt.trim() == title.trim();
        })
    }, 20000)
  });

  this.Given(/^I fill "([^"]*)" with "([^"]*)"$/, function (placeholder, value) {
    var input = element(By.css('input[placeholder="' + placeholder + '"]'));
    input.sendKeys(value);
  });

  this.Given(/^I fill textarea by "([^"]*)" with "([^"]*)"$/, function (placeholder, value) {
    var textarea = element(By.css('textarea[placeholder="' + placeholder + '"]'));
    textarea.sendKeys(value);
  });

  this.Given(/^I press enter$/, function () {
    var enter = browser.actions().sendKeys(protractor.Key.ENTER);
    enter.perform();
  });

  this.Given(/^I fill id "([^"]*)" with "([^"]*)"$/, function (id,value) {
    var input = element(By.css('#'+ id));
    input.sendKeys(value);
  });

  this.Given(/^I Press "([^"]*)"$/, function (value) {
    var button = element(By.css('input[value="' + value + '"]'));
    button.click();
  });

  this.Given(/^I Click id "([^"]*)"$/, function (id) {
    var radiob = element(By.css('#' + id));
    radiob.click();
  });

  this.Given(/^I Click Dropdown by Placeholder "([^"]*)"$/, function (placeholder) {
    var dropdown = element(By.css('select[placeholder="' + placeholder + '"]'));
    dropdown.click();
  });

  this.Given(/^I Click Option by Label "([^"]*)"$/, function (label) {
    var option = element(By.css('option[label="' + label + '"]'));
    option.click();
  });

  this.Given(/^I Click label by for "([^"]*)"$/, function (itsFor) {
    var checkbox = element(By.css('label[for="' + itsFor + '"]'));
    checkbox.click();
  });

  this.Given(/^I Click Link by Partial Text "([^"]*)"$/, function (partial) {
    var linkText = element(By.partialLinkText(partial));
    linkText.click();
  });

  this.Given(/^I clear input by id "([^"]*)"$/, function (clearing) {
    var clearInput = element(By.css('#' + clearing));
    clearInput.clear();
  });


  this.Then(/^should the title of the page be "([^"]*)"$/, function (expectedPageTitle) {
    return browser.getTitle().then(function (title) {
      assert.equal(title, expectedPageTitle, ' title is "' + title + '" but should be "' + expectedPageTitle);
    });
  });

  this.Then(/^should the title of the place be "([^"]*)"$/, function (expectedPlaceTitle) {
    element(By.css(".navbar-top .name")).getText().then(function (title) {
      assert.equal(title.trim(), expectedPlaceTitle, ' title is "' + title + '" but should be "' + expectedPlaceTitle);
    });
  });

  this.Then(/^should the title be "([^"]*)"$/, function (expectedTitle) {
    element(by.css('.testing-title')).getText().then(function (title) {
      assert.equal(title.trim(), expectedTitle, ' title is "' + title + '" but should be "' + expectedTitle);
    });
  });


  this.Then(/^should the title1 be "([^"]*)"$/, function (expectedTitle1) {
    element(by.css('.testing-title1')).getText().then(function (title) {
      assert.equal(title.trim(), expectedTitle1, ' title is "' + title + '" but should be "' + expectedTitle1);
    });
  });

  this.Then(/^should see "([^"]*)" error message$/, function (expectedError) {
    return element(By.css(".testing_err")).getText().then(function (error) {
      return assert.equal(error.trim(), expectedError, ' error is "' + error + '" but should be "' + expectedError);
    }).catch(function () {
      return assert.ok(false, 'Can not find message!')
    });
  });

  this.Then(/^should go to the page "([^"]*)"$/, function (url) {
    browser.get(browser.baseUrl + url);
  });
  this.Then(/^should the title of the place be "([^"]*)"$/, function (expectedPlaceTitle) {
    element(By.css(".navbar-top .name")).getText().then(function (title) {
      assert.equal(title.trim(), expectedPlaceTitle, ' title is "' + title + '" but should be "' + expectedPlaceTitle);
    });
  });

  this.Then(/^should the message be "([^"]*)"$/, function (expectedMessage) {
    element(By.css(".toast-message")).getText().then(function (title) {
      assert.equal(title.trim(), expectedMessage, ' title is "' + title + '" but should be "' + expectedMessage);
    });
  });
//------------url selectors----------------//
  this.Then(/^should the current url be "([^"]*)"$/, function (expectedUrl) {
    var checkUrl = function (expectedUrl) {
      return browser.getLocationAbsUrl()
        .then(function(url){
          if(url.indexOf(expectedUrl) > 0){
            throw(url)
          } else {
            return url
          }
        })
        .catch(function (url) {
          return url
        });
    };
    return browser.wait(checkUrl(expectedUrl), 15000).then(function (wrongUrl) {
      assert.equal(wrongUrl.trim(), expectedUrl, ' title is "' + wrongUrl + '" but should be "' + expectedUrl);
    });
  });

  this.Then(/^should the title be "([^"]*)"$/, function (expectedTitle) {
    element(by.css('.testing-title')).getText().then(function (title) {
      assert.equal(title.trim(), expectedTitle, ' title is "' + title + '" but should be "' + expectedTitle);
    });
  });


  this.Then(/^should the title1 be "([^"]*)"$/, function (expectedTitle1) {
    element(by.css('.testing-title1')).getText().then(function (title) {
      assert.equal(title.trim(), expectedTitle1, ' title is "' + title + '" but should be "' + expectedTitle1);
    });
  });

  this.Then(/^should see "([^"]*)" error message$/, function (expectedError) {
    return element(By.css(".testing_err")).getText().then(function (error) {
      return assert.equal(error.trim(), expectedError, ' error is "' + error + '" but should be "' + expectedError);
    }).catch(function () {
      return assert.ok(false, 'Can not find message!')
    });
  });

  this.Then(/^the message have to be "([^"]*)"$/, function (expectedMessage) {
    element(By.css(".toast-message .toast-success")).getText().then(function (no) {
      assert.equal(no.trim(), expectedMessage, ' title is "' + no + '" but should be "' + expectedMessage);
    });
  });


//---------------------attach files---------------------------------//

  this.Given(/^I Attach dog-png$/, function () {

    var path = require('path');
    var process = require('process');

    var fileToUpload = './e2e/assets/dog.png',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
      console.log(absolutePath)
    element(by.css('input[type="file"]')).sendKeys(absolutePath);


  });

//------------------------------------------------------------------//

};
