#Feature: Create and Delete a place or subplace
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: jerry create a place
#    Given I Click by ngClick "ctlSidebar.openCreatePlaceModal($event);"
#    When
