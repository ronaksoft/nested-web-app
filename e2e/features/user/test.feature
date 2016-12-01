#Feature: User: login
#  As a user of Nested
#  I should be able to go to Login page and login
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
#    Given I Click on sidebar "signout"
#    When I wait 5s
#    When I wait 5s
#    Then should see "Sign in"
