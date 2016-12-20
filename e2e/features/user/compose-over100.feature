Feature: User: compose
  As a user of Nested
  I should be able to send message to a place or places

  Scenario: Login user with true info
    Given I go to the page "/login"
    Given I fill "Username" with "test1"
    Given I fill "Password" with "111111"
    Given I Press "Sign in"
    When I wait 10s
    Then should the title of the place be "Feed"

  Scenario:
    Given I Click on sidebar "compose"
    Then should the title of the place be "Compose"

  Scenario: attachments under 50
    When I wait 2s
    Given I fill "Add a Subject ..." with "testing-compose"
    When I wait 2s
    Given I fill "Type place name or email address..." with "ali"
    When I wait 5s
    Given I press enter
    When I wait 2s
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    When I wait 5s
    When Wait for Upload to be finished
    When I wait 5s
    Given I Click Link by Partial Text "Send"
    When Wait to see success-msg
    When I wait 2s
    Then should the title of the place be "Feed"

  Scenario:
    When I wait 2s
    Given I Click on sidebar "compose"
    Then should the title of the place be "Compose"

  Scenario: attachments over 50
    When I wait 2s
    Given I fill "Add a Subject ..." with "testing-compose"
    When I wait 2s
    Given I fill "Type place name or email address..." with "test-mapping"
    When I wait 5s
    Given I press enter
    When I wait 2s
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    Given I Attach dog-png
    When I wait 5s
    When Wait for Upload to be finished
    When I wait 5s
    Given I Click Link by Partial Text "Send"
    When should the message be "1.attachments"

