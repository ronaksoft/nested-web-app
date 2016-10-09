#Feature: User: search
#  As a user of Nested
#  I should be able to search
#
#  Scenario: Sign in
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
#  Scenario: Search in nav-bar
#    Given I Click id "test-search"
#    When I wait 2s
#    Given I fill "Search in all places" with "welcome"
#    When I wait 2s
#    Given I press enter
#    When I wait 2s
#    Then should go to the page "/search/welcome"
##    Then should the url of the page be "/search/welcome"
#
#  Scenario: Search in search page
#    Given I fill id "clear" with "welcome"
#    When I wait 5s
#    Given I clear input by id "clear"
#    When I wait 5s
#    Given I fill id "clear" with "welcome"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I Click id "button-search"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#
