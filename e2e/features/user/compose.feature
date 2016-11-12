Feature: User: compose
  As a user of Nested
  I should be able to send message to a place or places

  Scenario: Login user with true info
    Given I go to the page "/login"
    When  Wait to loading hide
    Given I fill "Username" with "test1"
    Given I fill "Password" with "111111"
    Given I Press "Sign in"
    When I wait 10s
    Then should the title of the place be "All Places"

  Scenario:
    Given I Click on sidebar "compose"
    When I Wait till line loader hide
    Then should the title of the place be "Compose"

  Scenario:
    Given I fill "Type place name or email address..." with "test-mapping"
    When I wait 5s
    Given I press enter
    When I wait 2s
    Given I Attach dog-png
    Given I Attach cat-png
    Given I Attach music
    When I wait 5s
    When Wait for Upload to be finished
    Given I fill "Add a Subject ..." with "testing-compose"
    Given I Click id "tinymce"
    Given I fill id "tinymce" with "yo grabbing tinymce is working"
    Given I Click Link by Partial Text "Send"
    When Wait to see success-msg
    When I wait 2s
    Then should the title of the place be "All Places"


