Feature: in this feature we are testing
          "show in feed" option

  Scenario: user logs in
    Given I go to the page "/login"
    When Wait to loading hide
    Given I fill "Username" with "testi"
    Given I fill "Password" with "111111"
    Given I Press "Sign in"
    Then current tab must be "Feed"

  Scenario:
