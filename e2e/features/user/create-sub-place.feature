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
#    Then should the title of the place be "test mapping"
#
#
#  Scenario: Setting page mapping: create an Open sub-place in personal place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create an Open Place"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create an Open Place"
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-personal-open-sub-place"
#    When I wait 5s
#    Given I Click by ngClick "ctlCreate.changeId(ctlCreate.place.id)"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "test23"
#    When I wait 5s
#    Given I Click by ngClick "$close('ok')"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    Given I Click id "submit-place"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "test mapping"
#
#  Scenario: Delete a sub-place of personal place
#
#    Given I Click on "test-mapping.test23" place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "test-mapping.test23"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
