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
#    Then should the title of the place be "All Places"
#
#  Scenario: edit profile
#    Given I Click Link by Partial Text "@test1"
#    When I Wait till line loader hide
#    When I wait 2s
#    Given I Click Link by Partial Text "Edit My profile"
#    When I Wait till line loader hide
#    When I wait 2s
#    Given I Click Link by Partial Text "Change Password"
#    When I Wait till line loader hide
#    When I wait 2s
#    Then should the title of the place be "Change Password"
#
#  Scenario: change password
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
#     When I Wait till line loader hide
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
#     Given I Click Option by Label "October"
#     Given I Click Dropdown by Placeholder "Day"
#     When I wait 2s
#     Given I Click Option by Label "20"
#     Given I Click Dropdown by Placeholder "Year"
#     When I wait 2s
#     Given I Click Option by Label "1980"
#     When I wait 5s
#     Given I Press "Save & Exit"
#     When I wait 5s
#     Then should the title of the place be "Profile"
#
#   Scenario: sign out
#     When I Wait till line loader hide
#     Given I Click Link by Partial Text "Sign out"
#     When I Wait till line loader hide
#     When I wait 5s
#     Then should the current url be "/signin"
#     When I wait 10s
