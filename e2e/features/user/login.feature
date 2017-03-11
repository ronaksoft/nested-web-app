#Feature: User: login/logout
#  As a user of Nested
#  I should be able to go to nested fine
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "kayvan"
#    Given I fill "Password" with "1234"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"

#  Scenario:
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
