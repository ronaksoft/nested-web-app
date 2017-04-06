#Feature: User: Quick Post
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: jerry goes to "quick-post" place and share a post in quick mode
#    Given I Click on "quick-post" place in sidebar
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When should the title of the place be "quick-post"
#    When current tab is "Posts"
#    Given I Click input by dataNgModel "ctlCompose.model.subject"
#    Given I write "quick post testing"
#    Given I press enter
#    Given I write "it is working"
#    Given I Click on "bookmark-test" place in sidebar
#    When Wait to see leave-modal
#    Given I Click by ngClick "$close(false);"
#    When should the title of the place be "quick-post"
#    Given I Click on "bookmark-test" place in sidebar
#    When Wait to see leave-modal
#    Given I Click by ngClick "$close(true);"
#    When should the title of the place be "bookmark-test"
#    Then current tab must be "Posts"
#
#
#  Scenario: jerry goes to "quick-post" place and share a post in quick mode
#    Given I Click on "quick-post" place in sidebar
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When should the title of the place be "quick-post"
#    When current tab is "Posts"
#    Given I Click input by dataNgModel "ctlCompose.model.subject"
#    Given I write "quick post testing"
#    Given I press enter
#    Given I write "it is working"
#    Given I Click by ngClick "ctlCompose.send()"
#    When Wait to see success-msg
#    Then current tab must be "Posts"
#
#
#  Scenario:
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
#
