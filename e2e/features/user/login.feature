#Feature: User: login
#  As a user of Nested
#  I should be able to go to Login page and login
#
#  Scenario: Login user with invalid username
#    Given I go to the page "/login"
#    When I wait 10s
#    Given I fill "Username" with "teeest1"
#    Given I fill "Password" with "123456"
#    Given I Press "Sign in"
#    When I wait 10s
#    Then should see "Invalid Username or Password" error message
#
#
#  Scenario: Login user with invalid password
#    Given I fill "Username" with "test1"
#    Given I fill "Password" with "12346"
#    Given I Press "Sign in"
#    When I wait 10s
#    Then should see "Invalid Username or Password" error message
#
#  Scenario: Login user with true info
#    Given I fill "Username" with "test1"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    When I wait 10s
#    Then should the title of the place be "All Places"
