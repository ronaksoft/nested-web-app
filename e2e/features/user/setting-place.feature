#Feature: User: login
#  As a user of Nested
#  I should be able to change setting of my places
#
#  Scenario: Login user with invalid username
#
#    Given I go to the page "/login"
#    When I wait 5s
#    Given I fill "Username" with "test1"
#    When I wait 2s
#    Given I fill "Password" with "111111"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Create a place from sidebar 1
#
#    Given I Click on plus of "create" in sidebar
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-create-place14"
#    When I wait 5s
#    Given I Click id "PlaceID"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "create14"
#    When I wait 5s
#    Given I Click id "change-save"
#    When I wait 5s
#    Given I Click by ngClick "ctlCreate.setReceivingOff();"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    When I wait 5s
#    Given I Click Option by value "everyone"
#    When I wait 5s
#    Given I Click id "submit-place"
#    When I wait 5s
#    Given I Click id "close-setting-place"
#    When I wait 5s
#    Then should the title of the place be "test-create-place14"
#
#  Scenario: Setting page 2
#    Given I Click on "create14" place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Place Settings"
#    When I wait 5s
#    Given I Attach Steve
#    When I wait 5s
#    Given I Click by ngClick "ctlSettings.setReceivingOff();"
#    When I wait 5s
#    Given I Click Option by value "creators"
#    When I wait 5s
#    Given I Click by dataNgClick "ctlSettings.addMember()"
#    When I wait 5s
#    Given I fill "Name, email or phone number  ..." with "shayestehn"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I Invite by dataNgClick "addMemberCtrl.add()"
#    When I wait 5s
#    Given I Click icon by ngIf "memberCtrl.hasRemoveAccess || memberCtrl.hasControlAccess"
#    When I wait 5s
#    Given I Click by ngClick "memberCtrl.remove();"
#    When I wait 5s




