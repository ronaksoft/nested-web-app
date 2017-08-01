#Feature: in this feature we are testing
#          "show in feed" option
#
#  Scenario: user logs in
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    When I wait 2s
#    Then must see no posts
#
#  Scenario: user goes to test-feeding and check the "Show in Feed" option
#    Given I Click on "test-feeding" place in sidebar
#    When I wait 2s
#    When should the title of the place be "test feeding"
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Given I Click Triple-dot
#    When I wait 1s
#    Given I Click by ngClick "ctlFullNavbar.toggleBookmark()"
#    When I wait 1s
#    Given I Click on href "feed"
#    When current tab is "Feed"
#    Then must see at least one post
#
#  Scenario: user goes back to test-feeding and uncheck "Show in Feed" option
#    Given I Click on "test-feeding" place in sidebar
#    When should the title of the place be "test feeding"
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Given I Click Triple-dot
#    When I wait 1s
#    Given I Click by ngClick "ctlFullNavbar.toggleBookmark()"
#    When I wait 1s
#    Given I Click on href "feed"
#    When current tab is "Feed"
#    Then must see no posts
#
#  Scenario: sign out
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When Wait to loading hide
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
