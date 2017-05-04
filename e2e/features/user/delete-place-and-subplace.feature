#Feature: Create and Delete a place or subplace
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "user-8"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: jerry delete the created place
#    Given I Click on "test-create-place-id" place in sidebar
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When should the title of the place be "test create place name"
#    Given I Click Triple-dot
#    When I wait 2s
#    Given I Click by ngClick "ctlFullNavbar.confirmToRemove()"
#    When Wait see object with id "delete-view"
#    Given I Click by ngClick "nextStep =! nextStep; focusInput=true"
#    When I wait 1s
#    Given I fill input by name "placeIdInput" with "test-create-place-id"
#    Given I Click input by value "Delete"
#    When Wait to see success-msg
#    When I wait 2s
#    Then current tab must be "Feed"
#
#
#  Scenario:
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
#
