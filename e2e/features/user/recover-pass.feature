#Feature: User: Recover Password
#  As a user of Nested
#  I should be able to recover my password
#
#  Scenario: register step 1
#    Given I go to the page "#/signin"
#    When Wait to loading hide
#    When Wait see object with id "panel-signin"
#    Given I Click on href "recover/password"
#    When Wait see object with id "panel-register"
#    When Wait to see first step
#    Given I fill input by name "phone_number" with "123456789"
#    When I wait 2s
#    Given I Press "Next"
#    When I wait 2s
#    Then Must see second step
#
#  Scenario: register step 2
#    When I wait 2s
#    Given I fill input by name "verification_code" with "123456"
#    Given I Press "Verify"
#    Then Must see third step of recovering password
#
#  Scenario:
#    When I wait 5s
#    Given I fill "Enter a new password" with "111111"
#    Given I fill "Confirm new password" with "111111"
#    When I wait 2s
#    Given I Press "Reset"
#    Then Wait to see success-msg
#    When I wait 10s
#
#
#
