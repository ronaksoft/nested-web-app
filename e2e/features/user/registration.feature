#Feature: User: register
#  As a new user to Nested
#  I should register normally
#
#  Scenario: register step 1
#    Given I go to the page "/register"
#    When I wait 10s
#    Given I fill "(201) 555-5555" with "+989308429812"
#    Given I Press "Next"
#    When I wait 10s
#    Then should the title be "Phone Verification"
#
#  Scenario: register step 2
#    When I wait 10s
#    When I wait 10s
#    Given I Press "Verify"
#    When I wait 10s
#    Then should the next title be "Create an account"
#
#  Scenario: register step 3
#    Given I fill id "uid" with "test2"
#    Given I fill id "pass" with "123456"
#    Given I fill id "fname" with "test"
#    Given I fill id "lname" with "test"
#    Given I Click id "other"
#    Given I Click Dropdown by Placeholder "Month"
#    When I wait 2s
#    Given I Click Option by Label "June"
#    Given I Click Dropdown by Placeholder "Day"
#    When I wait 2s
#    Given I Click Option by Label "22"
#    Given I Click Dropdown by Placeholder "Year"
#    When I wait 2s
#    Given I Click Option by Label "1990"
#    When I wait 5s
#    Given I Click checkbox by Label "agreement"
#    When I wait 5s
#    Given I Press "Finish"
#    When I wait 10s
#    Then should the title of the place be "All Places"

