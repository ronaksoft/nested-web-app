#Feature: User: register
#  As a new user to Nested
#  I should register normally
#
#  Scenario: register step 1
#    Given I go to the page "/register"
#    When Wait to loading hide
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
#    Then Wait see object with id "uid"
#
#  Scenario: register step 3
#    Given I fill id "uid" with "kayvan-test3"
#    Given I fill input by name "nested_password" with "123456"
#    Given I fill input by name "nested_firstname" with "test"
#    Given I fill input by name "nested_lastname" with "test"
#    Given I fill input by name "nested_email" with "kayvannm@gmail.com"
#    When I wait 5s
#    Given I Press "Finish"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
#
