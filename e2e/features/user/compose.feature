#Feature: User: compose
#  As a user of Nested
#  I should be able to send message to a place or places
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: err - compose with empty recipient
#    Given I Click by ngClick "ctlSidebar.compose($event);"
#    When Wait to see compose-modal
#    When I wait 2s
#    Given I Attach dog-png
#    Given I Attach cat-png
#    When I wait 2s
#    Given I fill input by name "subject" with "testing-compose"
#    When I wait 5s
#    Given I Click by ngClick "ctlCompose.send()"
#    Then Wait to see error-msg
#
#  Scenario: user discards , filled compose message
#    Given I Click by ngClick "$dismiss()"
#    When Wait to see leave-modal
#    Given I Click by ngClick "$close(true);"
#    Then current tab must be "Feed"
#
#  Scenario: ok - compose with one recipient
#    Given I Click by ngClick "ctlSidebar.compose($event);"
#    When Wait to see compose-modal
#    Given I fill "Enter a Place or a Nested address..." with "hborgeson"
#    When I wait 5s
#    Given I press enter
#    When I wait 2s
#    Given I fill input by name "subject" with "testing-compose"
#    Given I Click by ngClick "ctlCompose.send()"
#    When I wait 2s
#    When Wait to see success-msg
#    Then current tab must be "Feed"
#
#
#  Scenario: this scenario is about sharing a post with two or more places that user have and don't have permission to share with them.
#
#    Given I Click by ngClick "ctlSidebar.compose($event);"
#    When Wait to see compose-modal
#    When I wait 5s
#    Given I fill recipient with "hborgeson"
#    When I wait 2s
#    Given I press enter
#    Given I fill recipient with "accounting"
#    When I wait 2s
#    Given I press enter
#    Given I fill recipient with "accounting.first"
#    When I wait 2s
#    Given I press enter
#    Given I fill input by name "subject" with "testing-compose"
#    Given I Click by ngClick "ctlCompose.send()"
#    When I wait 2s
#    When should see "Your message was sent, but accounting,accounting.first did not receive that" warning message
#    Then current tab must be "Feed"
#
#  Scenario:
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
