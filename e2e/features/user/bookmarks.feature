#Feature: checking notification and counter
#
#  Scenario: sign-in and goes to bokkmarks with no bookmarked message
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    When current tab is "Feed"
#    Given I switch to "bookmarks" tab
#    When current tab is "Bookmarks"
#    Then must see no posts
#    When I wait 2s
#
#  Scenario: kayvan goes to bookmark-test place and bookmark a post
#    Given I switch to "feed" tab
#    When current tab is "Feed"
#    Given I Click on "test-bookmark" place in sidebar
#    When should the title of the place be "test bookmark"
#    When I wait 5s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Given I pin a post
#    When I wait 2s
#    Then post must be pinned
#
#  Scenario: back to bookmarked place
#    Given I Click on href "feed"
#    When current tab is "Feed"
#    Given I switch to "bookmarks" tab
#    When current tab is "Bookmarks"
#    Then must see the bookmarked post
#
#  Scenario: unpin the bookmarked one and must see no post
#    Given I unpin a post
#    When I wait 2s
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
