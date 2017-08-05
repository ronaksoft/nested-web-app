#Feature: User: Quick Post
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "123456"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: checking discard and cancel button
#    Given I Click on "quick-post" place in sidebar
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When should the title of the place be "quick post"
#    When current tab is "Posts"
#    Given I Click input by dataNgModel "ctlCompose.model.subject"
#    Given I write "quick post testing"
#    Given I press enter
#    Given I write "it is working"
#    Given I Click on "bookmark-test" place in sidebar
#    When Wait to see leave-modal
#    Given I Click by ngClick "$close(false);"
#    When should the title of the place be "quick post"
#    When I wait 1s
#    Given I Click on "bookmark-test" place in sidebar
#    When Wait to see leave-modal
#    Given I Click by ngClick "$close(true);"
#    When I wait 5s
#    When should the title of the place be "bookmark test"
#    Then current tab must be "Posts"
#
#
#  Scenario: jerry goes to "quick-post" place and share a post in quick mode
#    Given I Click on "quick-post" place in sidebar
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When should the title of the place be "quick post"
#    When current tab is "Posts"
#    Given I Click input by dataNgModel "ctlCompose.model.subject"
#    Given I write "quick post testing"
#    When I wait 2s
#    Given I press enter
#    When I wait 2s
#    Given I write "it is working"
##    Given I Attach dog-png
##    Given I Attach cat-png
#    When I wait 2s
#    When Wait for Upload to be finished
#    Given I Click by ngClick "ctlCompose.send()"
#    When Wait to see success-msg
#    Then current tab must be "Posts"
#
#
#  Scenario: sign out
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When Wait to loading hide
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
