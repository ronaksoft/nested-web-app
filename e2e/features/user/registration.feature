#Feature: User: register
#  As a new user to Nested
#  I should register normally
#
#  Scenario: register step 1
#    Given I go to the page "/register"
#    When I wait 10s
#    Given I fill input by name "phone_number" with "9308429812"
#    Given I Press "Next"
#    When I wait 10s
#    Then should the reg-title be "Phone Verification"
#
#  Scenario: register step 2
#    When I wait 10s
#    When I wait 10s
#    Given I Press "Verify"
#    When I wait 10s
#    Then should the reg2-title be "Create an account"
#
#  Scenario: register step 3
#    Given I fill id "uid" with "kayvan-test1"
#    Given I fill id "pass" with "123456"
#    Given I fill id "fname" with "test"
#    Given I fill id "lname" with "test"
#    Given I fill id "email" with "kayvannm@gmail.com"
#    Given I Press "Finish"
#    When I wait 10s
#    Then should the title of the place be "All Places"

