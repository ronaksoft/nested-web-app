#Feature: User: checking ordering in "recently places"
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    When I wait 2s
#    Then current tab must be "Feed"
#
#  Scenario: "test-contact" place
#    Given I Click on "test-contact" place in sidebar
#    When I wait 2s
#    When should the title of the place be "test contact"
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Given I Click on "test-post-view" place in sidebar
#    When I wait 2s
#    When should the title of the place be "test post view"
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Then the text of this class "_df text-wrap _fw" must be "test contact"
#
#  Scenario: "test-for-compose" place
#    Given I Click on "test-for-compose" place in sidebar
#    When I wait 2s
#    When should the title of the place be "test for compose"
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Then the text of this class "_df text-wrap _fw" must be "test post view"
#
#  Scenario: "test-bookmark" place
#    Given I Click on "test-bookmark" place in sidebar
#    When I wait 2s
#    When should the title of the place be "test bookmark"
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Then the text of this class "_df text-wrap _fw" must be "test for compose"
#
#  Scenario: sign out
#     Given I Click on profile pop-over
#     Given I Click on href "signout"
#     When Wait to loading hide
#     Given I Click on profile pop-over
#     Given I Click on href "signout"
#     When I wait 5s
#     Then Must see object with id "panel-signin"
