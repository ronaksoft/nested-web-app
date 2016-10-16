Feature: User: Activity
  As a user of Nested
  I should be able to go activity page and click on any clickable items

  Scenario: Sign in
    When I wait 2s
    Given I go to the page "/login"
    When I wait 2s
    Given I fill "Username" with "test-mapping"
    When I wait 2s
    Given I fill "Password" with "123456"
    When I wait 2s
    Given I Press "Sign in"
    When I wait 2s
    Then should the title of the place be "All Places"

  Scenario: Activity 1
    When I wait 5s
    Given I Click Link by Partial Text "Activity"
    When I Wait till line loader hide
    When I wait 5s
    Then should the title of the place be "All Places"

  Scenario: Activity 2
    When I wait 5s
    Given I Click Link by Partial Text "Help"
    When I Wait till line loader hide
    When I wait 5s
    Then should the title of the place be "All Places"

  Scenario: Activity 3
    When I wait 5s
    Given I Click Link by Partial Text "4"
    When I Wait till line loader hide
    When I wait 5s






