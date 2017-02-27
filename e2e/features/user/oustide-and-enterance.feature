Feature: Registration

  Scenario: Registration step 1
    Given I go to the page "/register"
    When Wait to loading hide
    When Wait see object with id "panel-register"
    When Wait to see first step
    Given I fill input by name "phone_number" with "123456789"
    When I wait 2s
    Given I Press "Next"
    When I wait 2s
    Then Must see second step

  Scenario: Registration step 2
    When I wait 2s
    Given I fill input by name "verification_code" with "123456"
    Given I Press "Verify"
    Then Wait see object with id "uid"

  Scenario: Registration step 3
    Given I fill id "uid" with "kayvan-test3"
    Given I fill input by name "nested_password" with "123456"
    Given I fill input by name "nested_firstname" with "test"
    Given I fill input by name "nested_lastname" with "test"
    Given I fill input by name "nested_email" with "kayvannm@gmail.com"
    When I wait 5s
    Given I Press "Finish"
    When I wait 5s
    Then Must see object with id "panel-signin"

  Scenario: recover-pass step 1
    Given I Click on href "recover/password"
    When Wait see object with id "panel-register"
    When Wait to see first step
    Given I fill input by name "phone_number" with "123456789"
    When I wait 2s
    Given I Press "Next"
    When I wait 2s
    Then Must see second step

  Scenario: recover-pass step 2
    When I wait 2s
    Given I fill input by name "verification_code" with "123456"
    Given I Press "Verify"
    Then Must see third step of recovering password

  Scenario: recover-pass step 3
    When I wait 5s
    Given I fill "Enter a new password" with "111111"
    Given I fill "Confirm new password" with "111111"
    When I wait 2s
    Given I Press "Reset"
    Then Wait to see success-msg
    When I wait 10s


  Scenario: sign-in
    Given I go to the page "/login"
    When Wait to loading hide
    Given I fill "Username" with "kayvan"
    Given I fill "Password" with "1234"
    Given I Press "Sign in"
    Then current tab must be "Feed"

  Scenario: sign-out
    Given I Click on profile pop-over
    Given I Click on href "signout"
    When I wait 5s
    Then Must see object with id "panel-signin"
