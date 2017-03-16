#Feature: User: Recover Password
#  As a user of Nested
#  I should be able to recover my password
#
#  Scenario: recover password
#    Given I go to the page "/recover"
#    When I wait 10s
#    Given I fill input by name "phone_number" with "9308429812"
#    Given I Press "Next"
#    When I wait 10s
#    Then should the title be "Phone verification"
#
#  Scenario:
#    When I wait 10s
#    When I wait 10s
#    When I wait 5s
#    Given I Press "Verify"
#    When I wait 10s
#    Then should the title1 be "Reset password"
#
#  Scenario:
#    When I wait 5s
#    Given I fill "Enter new password" with "111111"
#    Given I fill "Confirm new password" with "111111"
#    When I wait 2s
#    Given I Press "Reset"
#    Then Wait to see success-msg
#    When I wait 10s
#
#
#
