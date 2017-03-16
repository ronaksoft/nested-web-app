#Feature: User: mention
#  As a user of Nested
#  I should be able to mention users or places
#
#  Scenario: Sign in 1
#    When I wait 2s
#    Given I go to the page "/login"
#    When I wait 2s
#    Given I fill "Username" with "sinaaa"
#    When I wait 2s
#    Given I fill "Password" with "12qwaszx"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 2s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: check the validity of mention user in mention popover
#    When I wait 5s
#    Given I Click id "mentions"
#    When I wait 5s
#    Given I Click Link by Partial Text "test mapping"
#    When I wait 5s
#    Given I Click id "post-view-close"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Sign out
#    When I wait 5s
#    Given I Click on sidebar "signout"
#    When I wait 5s
#    Then should see "Sign in"




