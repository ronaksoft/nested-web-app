Feature: User: login
  As a user of Nested
  I should be able to create a new place

  Scenario: Login user with invalid username

    Given I go to the page "/login"
    When I wait 5s
    Given I fill "Username" with "test1"
    When I wait 2s
    Given I fill "Password" with "111111"
    When I wait 2s
    Given I Press "Sign in"
    When I wait 5s
    Then should the title of the place be "All Places"

  Scenario: Create a place from sidebar

    Given I Click on plus of "create" in sidebar
    When I Wait till line loader hide
    When I wait 5s
    Given I Click id "close-create-place"
    When I wait 5s
    Given I Click on plus of "create" in sidebar
    When I wait 5s
    Given I fill "Marketing Development" with "test-create-place4"
    When I wait 5s
    Given I Click id "PlaceID"
    When I wait 5s
    Given I clear input by id "change-place-id"
    When I wait 5s
    Given I fill id "change-place-id" with "create4"
    When I wait 5s
    Given I Click id "change-save"
    When I wait 5s
    Given I Click label by for "notification"
    When I wait 5s
    Given I Click label by for "favo"
    When I wait 5s
    Given I Click id "submit-place"
    When I wait 5s
    Given I Click Option by value "everyone"
    When I wait 5s
    When I wait 5s
    Given I Click id "close-create-place"
