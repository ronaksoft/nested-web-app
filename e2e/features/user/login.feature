Feature: User: login
  As a user of Nested
  I should be able to go to Login page and login

  Scenario: Login user with true info
    Given I go on the page "/login"
    When Wait to loading hide
    Given I fill "Username" with "sinaa"
    Given I fill "Password" with "12qwaszx"
    Given I Press "Sign in"
    When I wait
    Then should the title of the place be "All Places"
