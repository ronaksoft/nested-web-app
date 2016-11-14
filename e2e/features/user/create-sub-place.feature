#Feature: User: login
#  As a user of Nested
#  I should be able to create a sub-place
#
#  Scenario: Login user with invalid username
#
#    When I wait 5s
#    Given I go to the page "/login"
#    When I wait 5s
#    Given I fill "Username" with "test-mapping"
#    When I wait 5s
#    Given I fill "Password" with "123456"
#    When I wait 5s
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: personal place
#    Given I Click on "test-mapping" place
#    When I wait 5s
#    Given I Click on "test-mapping" place
#    When I wait 2s
#    Given I Click Link by Partial Text "test-mapping@nested.me"
#    When I wait 5s
#    Then should the title of the place be "test mapping"
#
#
#  Scenario: Setting page mapping: create a sub-place 1
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create a sub-place"
#    When I wait 5s
#    Given I Click id "close-create-place"
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create a sub-place"
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-sub-place101"
#    When I wait 5s
#    Given I Click id "PlaceID"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "test23"
#    When I wait 5s
#    Given I Click id "change-save"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    Given I Click id "submit-place"
#    When I wait 5s
#    Given I Click id "close-create-place"
#
#  Scenario: Delete a sub-place
#
#
#
