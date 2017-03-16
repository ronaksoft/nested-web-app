#Feature: User: mention
#  As a user of Nested
#  I should be able to mention users or places
#
#  Scenario: Sign in 1
#    When I wait 2s
#    Given I go to the page "/login"
#    When I wait 2s
#    Given I fill "Username" with "test-mapping"
#    When I wait 2s
#    Given I fill "Password" with "123456"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 2s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Mention with "@" and "#" in postcard's comments
#    When I wait 5s
#    Given I Click on "ronaksoft" place
#    When I wait 5s
#    Given I fill "write your comment ..." with "@"
#    When I wait 5s
#    Given I fill "write your comment ..." with "sinaaa"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I fill "write your comment ..." with "#"
#    When I wait 5s
#    Given I fill "write your comment ..." with "ronaksoft"
#    Given I press enter
#    When I wait 5s
#
#  Scenario: Mention with "@" and "#" in post-view's comments
#    When I wait 5s
#    Given I Click id "post-view"
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "@"
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "kayvannm"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "#"
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "ronaksoft"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "@"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I press enter
#    Given I Click id "post-view-close"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
