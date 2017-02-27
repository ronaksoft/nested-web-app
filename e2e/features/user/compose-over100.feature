#Feature: User: compose
#  As a user of Nested
#  I should be able to send message to a place or places
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "kayvan"
#    Given I fill "Password" with "1234"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: compose with many attachments
#    Given I Click by ngClick "ctlSidebar.compose($event);"
#    When Wait to see compose-modal
#    Given I fill "Enter a Place or a Nested address..." with "hborgeson"
#    When I wait 5s
#    Given I press enter
#    When I wait 2s
#    Given I fill input by name "subject" with "testing-compose"
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach dog-png
#    Given I Attach cat-png
#    When I wait 10s
#    When I wait 10s
#    When Wait for Upload to be finished
#    Given I Click by ngClick "ctlCompose.send()"
#    When Wait to see success-msg
#    Then current tab must be "Feed"
