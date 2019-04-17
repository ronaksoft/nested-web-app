var assert = require('assert'),
  tmpResult;

module.exports = function () {

  this.When(/^I wait 10s$/, function () {
    return browser.sleep(10000);
    });

  this.When(/^I wait 5s$/, function () {
    return browser.sleep(5000);

  });

  this.When(/^I wait 2s$/, function () {
    return browser.sleep(2000);

  });

  this.When(/^I wait 1s$/, function () {
    return browser.sleep(1000);

  });

  this.When(/^Wait to loading hide$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.loading-container'))), 50000);
  });

  this.When(/^Wait for hiding of all loadings$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.nst-loading'))), 50000);
  });


  this.When(/^Wait for Upload to be finished$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('div[progressbar-mode="circle"]'))), 50000);
  });

  this.setDefaultTimeout(600 * 1000);

  this.Given(/^I go to the page "([^"]*)"$/, function (url) {
    browser.get(browser.baseUrl + url);
  });

  this.Given(/^I fill "([^"]*)" with "([^"]*)"$/, function (placeholder, value) {
    var input = element(By.css('input[placeholder="' + placeholder + '"]'));
    input.sendKeys(value);
  });

  this.Given(/^I fill recipient with "([^"]*)"$/, function (value) {
    var input = element(By.css('.ui-select-search'));
    input.sendKeys(value);
  });

  this.Given(/^I fill input by ngModel "([^"]*)" with "([^"]*)"$/, function (filling, value) {
    var fillInput1 = element(By.css('input[ng-model="' + filling + '"]'));
    fillInput1.sendKeys(value);
  });

  this.Given(/^I fill id "([^"]*)" with "([^"]*)"$/, function (id,value) {
    var input = element(By.css('#'+ id));
    input.sendKeys(value);
  });

  this.Given(/^I Press "([^"]*)"$/, function (value) {
    var button = element(By.css('input[value="' + value + '"]'));
    button.click();
  });

  this.Given(/^I Press button by ngClick "([^"]*)"$/, function (ngClick){
    var ClickButton = element(By.css('button[ng-click="' + ngClick + '"]'));
    ClickButton.click();
  });

  this.Given(/^I Press Next$/, function (){
    var nextButton = element(By.css('button[class="submit"'));
    nextButton.click();
  });

//--------------------- post pin and unpin -----------------//

  this.Given(/^I pin a post$/, function () {
    var pinning = element(By.css('.pin-post'));
    pinning.click();
  });

  this.Given(/^I unpin a post$/, function () {
    var unpinning = element(By.css('.pinned'));
    unpinning.click();
  });

  this.Then(/^post must be pinned$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.pinned'))), 50000);
  });

//----------------------------------------------------------//

  this.Given(/^I Click id "([^"]*)"$/, function (id) {
    var radiob = element(By.css('#' + id));
    radiob.click();
  });

  this.Given(/^I Click class "([^"]*)"$/, function (iclass) {
    var radiob = element(By.css('.' + iclass));
    radiob.click();
  });

  this.Given(/^I Click on href "([^"]*)"$/, function (destination) {
    var pS = element(By.css('*[href="#/'+ destination +'"]'));
    pS.click();
  });


  this.Given(/^I Click on "([^"]*)" place in sidebar$/, function (destination) {
    var pS3 = element(By.css('a[href="#/places/'+ destination +'/messages"]'));
    pS3.click();
  });


  this.Given(/^I Click Option by Label "([^"]*)"$/, function (label) {
    var option = element(By.css('*[label="' + label + '"]'));
    option.click();
  });

  this.Given(/^I Click Link by Partial Text "([^"]*)"$/, function (partial) {
    var linkText = element(By.partialLinkText(partial));
    linkText.click();
  });

  this.Given(/^I Click by ngClick "([^"]*)"$/, function (ngClickA){
    var ClickableElement = element(By.css('*[ng-click="' + ngClickA + '"]'));
    ClickableElement.click();
  });

  this.Given(/^I Click by ngModel "([^"]*)"$/, function (ngModel){
    var ClickableElement = element(By.css('*[ng-model="' + ngModel + '"]'));
    ClickableElement.click();
  });

  this.Given(/^I Click on profile pop-over$/, function () {
    var profilePop = element(By.css('div[ng-click="ctlSidebar.profileOpen =! ctlSidebar.profileOpen;ctlSidebar.mentionOpen = false;$event.preventDefault();$event.stopPropagation()"]'));
    profilePop.click();
  });

  this.Given(/^I Click Triple-dot$/, function () {
    var EC = protractor.ExpectedConditions;
    var Triple = element(by.deepCss('#navbar-popover'));
    browser.wait(EC.elementToBeClickable(Triple), 5000);
    Triple.click();

  });

  this.Given(/^I Click by ngIf "([^"]*)"$/, function (ngIf){
    var menu = element(By.css('*[ng-if="' + ngIf + '"]'));
    menu.click();
  });

  this.Given(/^I Click icon by class "([^"]*)"$/, function (svgClass){
    var svgWithClass = element(By.css('svg[class="' + svgClass + '"]'));
    svgWithClass.click();
  });


  this.Given(/^I Click input by dataNgModel "([^"]*)"$/, function (dataNgModel){
    var select = element(By.css('input[data-ng-model="' + dataNgModel + '"]'));
    select.click();
  });

  this.Given(/^I clear input by name "([^"]*)"$/, function (clearing) {
    var clearInput = element(By.css('input[name="' + clearing + '"]'));
    clearInput.clear();
  });

  this.Given(/^I fill input by name "([^"]*)" with "([^"]*)"$/, function (name, value) {
    var input = element(By.css('input[name="' + name + '"]'));
    input.sendKeys(value);
  });

  this.Given(/^I Click input by value "([^"]*)"$/, function (value) {
    var input = element(By.css('input[value="' + value + '"]'));
    input.click();
  });
  this.When(/^should the title of the place be "([^"]*)"$/, function (expectedPlaceTitle) {
    element(By.css('cite[fit-text]')).getText().then(function (title) {
      assert.equal(title.trim(), expectedPlaceTitle, ' title is "' + title + '" but should be "' + expectedPlaceTitle);
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

  this.Then(/^should the message be "([^"]*)"$/, function (expectedMessage) {
    element(By.css(".toast-message")).getText().then(function (title) {
      assert.equal(title.trim(), expectedMessage, ' title is "' + title + '" but should be "' + expectedMessage);
    });
  });

  this.When(/^should the body of the compose be "([^"]*)"$/, function (expectedBody) {
    element(By.css(".cke_wysiwyg_div .cke_reset .cke_enable_context_menu .cke_editable .cke_editable_themed .cke_contents_ltr .cke_show_borders")).getText().then(function (title) {
      assert.equal(title.trim(), expectedBody, ' title is "' + title + '" but should be "' + expectedBody);
    });
  });

  this.Then(/^current tab must be "([^"]*)"$/, function (expectedTab) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.active'))), 50000).then(function () {
        element(By.css('.active')).getText().then(function (currentTab) {
        assert.equal(currentTab.trim(), expectedTab, ' current tab is "' + currentTab + '" but should be "' + expectedTab);
      });
    });
  });

  this.When(/^current tab is "([^"]*)"$/, function (expectedTab) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.active'))), 50000).then(function () {
      element(By.css('.active')).getText().then(function (currentTab) {
        assert.equal(currentTab.trim(), expectedTab, ' current tab is "' + currentTab + '" but should be "' + expectedTab);
      });
    });
  });

  this.Given(/^I switch to "([^"]*)" tab$/, function (tab) {
    var nextTab = element(By.css('a[href="#/' + tab + '"]'));
    nextTab.click();
  });

  this.Then(/^must see no posts$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.post-card'))), 50000);
  });

  this.Then(/^must see the bookmarked post/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.post-card'))), 50000);
  });


  this.Then(/^must see at least one post/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.post-card'))), 50000);
  });

  this.When(/^Wait to see success-msg$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.toast-success'))), 50000);
  });

  this.Then(/^Wait to see error-msg$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.toast-error'))), 50000);
  });

  this.When(/^Wait to see warn-msg$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.toast-warning'))), 50000);
  });

  this.When(/^should see "([^"]*)" warning message$/, function (expectedWarning) {
    return element(By.css(".toast-warning")).getText().then(function (noExpect) {
      return assert.equal(noExpect.trim(), expectedWarning, ' error is "' + noExpect + '" but should be "' + expectedWarning);
    }).catch(function () {
      return assert.ok(false, 'Can not find message!')
    });
  });


  this.When(/^should see "([^"]*)" place name$/, function (expectedWarning) {
    return element(By.deepCss('span[class="place-name ng-binding"]')).getText().then(function (noExpect) {
      return assert.equal(noExpect.trim(), expectedWarning, ' error is "' + noExpect + '" but should be "' + expectedWarning);
    }).catch(function () {
      return assert.ok(false, 'Can not find message!')
    });
  });


  this.When(/^Wait to see subject "([^"]*)"$/, function (composeSubject) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.textToBePresentInElementValue($('#compose-subject'),composeSubject), 50000);
  });

  this.When(/^Wait to see leave-modal$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('#delete-view'))), 50000);
  });



  this.When(/^Wait to see invite-modal$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('#add-view'))), 50000);
  });

  this.When(/^Wait to see compose-modal$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.compose-modal-body'))), 50000);
  });

  this.When(/^Wait to see create place step "([^"]*)"$/, function (expectedStep) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('div[ng-if="ctrl.step == ' + expectedStep + '"]'))), 50000);
  });

  this.When(/^Wait to see first step$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.register-step'))), 50000);
  });


  this.Then(/^Must see second step$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.nst-mood-cheerful'))), 50000);
  });

  this.Then(/^Must see third step of recovering password$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('input[value="Reset"]'))), 50000);
  });

  this.When(/^should see "([^"]*)"$/, function (text) {
    element(by.css('.col-xs-9 nst-font-xlarge')).getText().then(function (title) {
      assert.equal(title.trim(), text, ' title is "' + title + '" but should be "' + text);
    });
  });

  this.When(/^Wait see object with id "([^"]*)"$/, function (objectId) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('#' + objectId))), 50000);
  });

  this.When(/^Wait see object with class "([^"]*)"$/, function (objectClass) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.' + objectClass))), 50000);
  });

  this.Then(/^Must see object with id "([^"]*)"$/, function (tObjectId) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('#' + tObjectId))), 50000);
  });

  this.Then(/^Url Should Contains$/, function (urlc) {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.urlContains('messages'), 50000);
    urlc(null, 'pending');
  });

  this.Given(/^I Attach dog-png$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/dog.png',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.Given(/^I Attach Bill$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/Bill.png',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.Given(/^I Attach Steve$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/steve.jpg',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.Given(/^I Attach cat-png$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/cat.png',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.Given(/^I Attach music$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/no5.mp3',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.Given(/^I Attach pdf-document$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/document.pdf',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.Given(/^I Attach xlsx-document$/, function () {
    var path = require('path');
    var process = require('process');
    var fileToUpload = './e2e/assets/document.xlsx',
      absolutePath = path.resolve(process.cwd(), fileToUpload);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  });

  this.When(/^Wait to see image$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('img[]'))), 50000);
  });

  this.When(/^Wait to see pdf$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.attach-thumbnail-pdf'))), 50000);
  });

  this.When(/^Wait to see document$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.attach-thumbnail-document'))), 50000);
  });

  this.When(/^Wait to see music$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.attach-thumbnail-audio'))), 50000);
  });

  this.Given(/^new tab$/, function () {
    browser.actions().keyDown(protractor.Key.CONTROL).sendKeys('t').perform();
  });

  this.Given(/^I write "([^"]*)"$/, function (key) {
    browser.actions().sendKeys(key).perform();
  });

  this.Given(/^I press tab$/, function () {
    var tab = browser.actions().sendKeys(protractor.Key.TAB);
    tab.perform();
  });

  this.Given(/^I press enter$/, function () {
    var enter = browser.actions().sendKeys(protractor.Key.ENTER);
    enter.perform();
  });

  this.Given(/^I Click edit-icon by open-custom-modal "([^"]*)"$/, function (customModal) {
    var icon = element(By.css('svg[open-custom-modal="' + customModal + '"]'));
    icon.click();
  });

//-----------------------------------------------------------------------------
// TODO : important, use this for notification counter in title

  this.Then(/^should the title of the page be "([^"]*)"$/, function (expectedPageTitle) {
    return browser.getTitle().then(function (title) {
      assert.equal(title, expectedPageTitle, ' title is "' + title + '" but should be "' + expectedPageTitle);
    });
  });
//-----------------------------------------------------------------------------

  this.Then(/^the text of this class "([^"]*)" must be "([^"]*)"$/, function (style,expectedText) {
    element(By.css('*[class="' + style + '"]')).$$('span').getText().then(function (availableText) {
      assert.equal(availableText, expectedText, ' text is "' + availableText + '" but should be "' + expectedText);
    })
  });

  this.Given(/^click first contact$/, function () {
    var firstContact = element(by.repeater('contact in ctrl.contacts').row(0).column('a'));
    firstContact.click();
  });

  this.When(/^the text of this class "([^"]*)" is "([^"]*)"$/, function (style,expectedText) {
    element(By.css('*[class="' + style + '"]')).$$('span').getText().then(function (availableText) {
      assert.equal(availableText, expectedText, ' text is "' + availableText + '" but should be "' + expectedText);
    })
  });



//--------------------------------------------------------------------------------


};
