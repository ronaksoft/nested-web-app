#Feature: User: login
#  As a user of Nested
#  I should be able to go to Login page and login
#
#  Scenario: Login user with invalid username
#    Given I go to the page "/login"
#    When I wait 10s
#    Given I fill "Username" with "teeest1"
#    When I wait 2s
#    Given I fill "Password" with "123456"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should see "Invalid Username or Password" error message
#
#
#  Scenario: Login user with invalid password
#    Given I fill "Username" with "test1"
#    When I wait 2s
#    Given I fill "Password" with "12346"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should see "Invalid Username or Password" error message
#
#  Scenario: Login user with true info
#    Given I fill "Username" with "test1"
#    When I wait 2s
#    Given I fill "Password" with "111111"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: change Password sc1
#    When I wait 5s
#    Given I Click on sidebar "profile"
#    When I wait 5s
#    Given I Click Link by Partial Text "Change Password"
#    When I wait 2s
#    Then should the title of the place be "Change Password"
#
#  Scenario: change Password sc2
#    Given I fill "Old Password" with "111111"
#    When I wait 2s
#    Given I fill "New Password" with "111111"
#    When I wait 2s
#    Given I fill "New Password Confirm" with "111111"
#    When I wait 2s
#    Given I Press "Change"
#    Then Wait to see success-msg
#
#   Scenario: edit profile
#     When I wait 5s
#     Given I Attach Steve
#     When I wait 5s
#     Given I Attach Bill
#     Given I clear input by name "firstName"
#     When I wait 2s
#     Given I fill input by name "firstName" with "test2"
#     When I wait 2s
#     Given I clear input by name "lastName"
#     When I wait 2s
#     Given I fill input by name "lastName" with "test2"
#     When I wait 2s
#     Given I Click Dropdown by Placeholder "Month"
#     When I wait 2s
#     Given I Click Option by Label "June"
#     Given I Click Dropdown by Placeholder "Day"
#     When I wait 2s
#     Given I Click Option by Label "30"
#     Given I Click Dropdown by Placeholder "Year"
#     When I wait 2s
#     Given I Click Option by Label "1970"
#     When I wait 5s
#     Given I Press "Save & Exit"
#     When I wait 5s
#     Then should the title of the place be "Feed"
#
#   Scenario: sign out
#     When I wait 5s
#     Given I Click on sidebar "signout"
#     When I wait 5
#     Then should see "Sign in"
