Feature: User: compose
  As a user of Nested
  I should be able to send message to a place or places

  Scenario: Login user with true info
    Given I go to the page "/login"
    Given I fill "Username" with "hborgeson"
    Given I fill "Password" with "1234"
    Given I Press "Sign in"
    When I wait 5s
    Then should the title of the place be "Feed"

  Scenario: user goes to compose page
    Given I Click on sidebar "compose"
    Then should the title of the place be "Compose"

  Scenario: error - compose with empty TO field
    When I wait 2s
    Given I Attach dog-png
    Given I Attach cat-png
    When I wait 2s
    Given I fill "Add a subject line..." with "testing-compose"
    When I wait 5s
    Given I Click Link by Partial Text "Send"
    When Wait to see error-msg
    When I wait 2s
    Then should the title of the place be "Compose"

  Scenario: user discards , filled compose message
    Given I Click Link by Partial Text "Discard"
    When Wait to see leave-modal
    Given I Click Link by Partial Text "Leave"
    When I wait 2s
    Then should the title of the place be "Feed"

  Scenario: user goes to compose page
    Given I Click on sidebar "compose"
    Then should the title of the place be "Compose"

  Scenario: error - send to no-access-sending
    Given I fill "Enter a Place name or a Nested address..." with "chikiw"
    When I wait 5s
    Given I press enter
    When I wait 2s
    Given I fill "Add a subject line..." with "testing-compose"
    Given I Click Link by Partial Text "Send"
    When Wait to see warn-msg
    When I wait 2s
    Then should the title of the place be "Feed"

  Scenario: user goes to compose page
    Given I Click on sidebar "compose"
    Then should the title of the place be "Compose"


  Scenario: successful sending
    Given I fill "Enter a Place name or a Nested address..." with "software"
    When I wait 5s
    Given I press enter
    When I wait 2s
    Given I Attach dog-png
    Given I Attach cat-png
    Given I Attach music
    When I wait 5s
    When Wait for Upload to be finished
    When I wait 5s
    Given I fill "Add a subject line..." with "testing-compose"
    When I wait 5s
    Given I Click Link by Partial Text "Send"
    When Wait to see success-msg
    When I wait 2s
    Then should the title of the place be "Feed"


