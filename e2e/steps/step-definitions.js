var assert = require('assert'),
  tmpResult;

module.exports = function () {

  this.When(/^I wait 10s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(10000);
    });

  this.When(/^I wait 5s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(5000);

  });

  this.When(/^I wait 2s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(2000);

  });

  this.When(/^I wait 1s$/, function () {
    browser.ignoreSynchronization = true;
    return browser.sleep(1000);

  });


  this.Given(/^I Click input by ng-keyup "([^"]*)"$/, function (ngkeyup) {
    var input = element(By.css('input[ng-keyup="' + ngkeyup + '"]'));
    input.click();
  });


  this.When(/^Wait to loading hide$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.loading-container'))), 50000);
  });

  this.When(/^Wait for hiding of all loadings$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.nst-loading'))), 50000);
  });


  this.When(/^Wait for Upload to be finished$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('div[progressbar-mode="circle"]'))), 50000);
  });

  this.setDefaultTimeout(600 * 1000);

  this.Given(/^I go to the page "([^"]*)"$/, function (url) {
    browser.get(browser.baseUrl + url);
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

  this.Given(/^I fill recipient with "([^"]*)"$/, function (value) {
    var input = element(By.css('.ui-select-search'));
    input.sendKeys(value);
  });

  this.Given(/^I fill input by ngModel "([^"]*)" with "([^"]*)"$/, function (filling, value) {
    var fillInput1 = element(By.css('input[ng-model="' + filling + '"]'));
    fillInput1.sendKeys(value);
  });

  this.Given(/^I fill textarea by "([^"]*)" with "([^"]*)"$/, function (placeholder, value) {
    var textarea = element(By.css('textarea[placeholder="' + placeholder + '"]'));
    textarea.sendKeys(value);
  });


  this.Given(/^I fill id "([^"]*)" with "([^"]*)"$/, function (id,value) {
    var input = element(By.css('#'+ id));
    input.sendKeys(value);
  });

  this.Given(/^I Press "([^"]*)"$/, function (value) {
    var button = element(By.css('input[value="' + value + '"]'));
    button.click();
  });

  this.Given(/^I Press button "([^"]*)"$/, function (type) {
    var button1 = element(By.css('button[type="' + type + '"]'));
    button1.click();
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

  this.Given(/^I Click Dropdown by Placeholder "([^"]*)"$/, function (placeholder) {
    var dropdown = element(By.css('select[placeholder="' + placeholder + '"]'));
    dropdown.click();
  });

  this.Given(/^I Click on href "([^"]*)"$/, function (destination) {
    var pS = element(By.css('a[href="#/'+ destination +'"]'));
    pS.click();
  });

  this.Given(/^I Click on "([^"]*)" in sidebar$/, function (destination) {
    var pS1 = element(By.css('a[href="#/messages/'+ destination +'"]'));
    pS1.click();
  });

  this.Given(/^I Click on "([^"]*)" place in sidebar$/, function (destination) {
    var pS3 = element(By.css('a[href="#/places/'+ destination +'/messages"]'));
    pS3.click();
  });


  this.Given(/^I Click Option by Label "([^"]*)"$/, function (label) {
    var option = element(By.css('option[label="' + label + '"]'));
    option.click();
  });

  this.Given(/^I Click Option by value "([^"]*)"$/, function (value) {
    var option = element(By.css('option[value="' + value + '"]'));
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

  this.Given(/^I clear input by ngModel "([^"]*)"$/, function (ngModel) {
    var clearInput1 = element(By.css('input[ng-model="' + ngModel + '"]'));
    clearInput1.clear();
  });

  this.Given(/^I Click by ngClick "([^"]*)"$/, function (ngClickA){
    var ClickableElement = element(By.css('*[ng-click="' + ngClickA + '"]'));
    ClickableElement.click();
  });

  this.Given(/^I Click on profile pop-over$/, function () {
    var profilePop = element(By.css('div[ng-click="ctlSidebar.profileOpen =! ctlSidebar.profileOpen;ctlSidebar.mentionOpen = false;$event.preventDefault();$event.stopPropagation()"]'));
    profilePop.click();
  });

  this.Given(/^I Click on switchDrag "([^"]*)" on navbar$/, function (switchDrag){
    var SwitchElement = element(By.css('div[switch-drag="' + switchDrag + '"]'));
    SwitchElement.click();
  });

  this.Given(/^I Click list by ngClick "([^"]*)"$/, function (ngClick){
    var list = element(By.css('li[ng-click="' + ngClick + '"]'));
    list.click();
  });

  this.Given(/^I Click by dataNgClick "([^"]*)"$/, function (dataNgClick){
    var box = element(By.css('div[data-ng-click="' + dataNgClick + '"]'));
    box.click();
  });

  this.Given(/^I Invite by dataNgClick "([^"]*)"$/, function (dataNgClick){
    var invite = element(By.css('div[data-ng-click="' + dataNgClick + '"]'));
    invite.click();
  });


  this.Given(/^I Click icon by ngIf "([^"]*)"$/, function (ngIf){
    var menu = element(By.css('svg[ng-if="' + ngIf + '"]'));
    menu.click();
  });

  this.Given(/^I Click icon by class "([^"]*)"$/, function (ngIf){
    var svgWithClass = element(By.css('svg[class="' + ngIf + '"]'));
    svgWithClass.click();
  });

  this.Given(/^I Click by ngModel "([^"]*)"$/, function (ngModel){
    var select = element(By.css('select[ng-model="' + ngModel + '"]'));
    select.click();
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

  this.Given(/^I Click icon by tooltip "([^"]*)"$/, function (text) {
    var icon = element(By.css('a[data-uib-tooltip="' + text + '"]'));
    icon.click();
  });

  this.Given(/^I Click text by tooltip "([^"]*)"$/, function (text) {
    var text = element(By.css('p[data-uib-tooltip="' + text + '"]'));
    text.click();
  });

  this.Given(/^I move mouse on hidden popover "([^"]*)"$/, function (dataPopover) {
    var popover = element(By.css('div[data-popover-is-open="' + dataPopover + '"]'));
    popover.mouseEnter().perform();
  });

  this.Then(/^should the title of the page be "([^"]*)"$/, function (expectedPageTitle) {
    return browser.getTitle().then(function (title) {
      assert.equal(title, expectedPageTitle, ' title is "' + title + '" but should be "' + expectedPageTitle);
    });
  });


  this.When(/^should the title of the place be "([^"]*)"$/, function (expectedPlaceTitle) {
    element(By.css('cite[fit-text]')).getText().then(function (title) {
      assert.equal(title.trim(), expectedPlaceTitle, ' title is "' + title + '" but should be "' + expectedPlaceTitle);
    });
  });

  this.Then(/^should the panel title be "([^"]*)"$/, function (expectedTitle) {
    element(by.css('.col-xs-9')).getText().then(function (title) {
      assert.equal(title.trim(), expectedTitle, ' title is "' + title + '" but should be "' + expectedTitle);
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


//---------------------------tabs sesion-----------------------//

  this.Then(/^current tab must be "([^"]*)"$/, function (expectedTab) {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.active'))), 50000).then(function () {
        element(By.css('.active')).getText().then(function (currentTab) {
        assert.equal(currentTab.trim(), expectedTab, ' current tab is "' + currentTab + '" but should be "' + expectedTab);
      });
    });
  });

  this.When(/^current tab is "([^"]*)"$/, function (expectedTab) {
    browser.ignoreSynchronization = true;
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

//--------------------------- messages -------------------------------------------//

  this.Then(/^must see no posts$/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.invisibilityOf(element(By.css('.post-card'))), 50000);
  });


  this.Then(/^must see the bookmarked post/, function () {
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.post-card'))), 50000);
  });

  this.When(/^Wait to see success-msg$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.toast-success'))), 50000);
  });

  this.Then(/^Wait to see error-msg$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.toast-error'))), 50000);
  });

  this.When(/^Wait to see warn-msg$/, function () {
    browser.ignoreSynchronization = true;
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
//----------------------------------------------- modals --------------------------------------------------------------------//



  this.When(/^Wait to see leave-modal$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('#delete-view'))), 50000);
  });

  this.When(/^Wait to see invite-modal$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('#add-view'))), 50000);
  });

  this.When(/^Wait to see compose-modal$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.modal-bo'))), 50000);
  });
                  //------create place-------//

  this.When(/^Wait to see create place step "([^"]*)"$/, function (expectedStep) {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('div[ng-if="ctrl.step == ' + expectedStep + '"]'))), 50000);
  });


//-------------------------------------- registration and recover-password ----------------------------------------------------//


  this.When(/^Wait to see first step$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.register-step'))), 50000);
  });

  this.Then(/^Must see second step$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('.nst-mood-cheerful'))), 50000);
  });

  this.Then(/^Must see third step of recovering password$/, function () {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.visibilityOf(element(By.css('input[value="Reset"]'))), 50000);
  });

//----------------------------------------------------------------------------------------------------------------------------//

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


//------------url selectors----------------//

  this.Then(/^Url Should Contains$/, function (urlc) {
    browser.ignoreSynchronization = true;
    var EC = protractor.ExpectedConditions;
    return browser.wait(EC.urlContains('messages'), 50000);
    urlc(null, 'pending');
  });

//---------------------attach files---------------------------------//

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



//------------------- combinated keys -----------------------------------------//

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

//------------------- specific for notification -------------------------------//


};

