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
#  Scenario: Search 1
#    Given I Click id "test-search"
#    When I wait 5s
#    Given I fill "Search in all places" with "welcome"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    When I wait 5s
#    Given I clear input by id "clear"
#    When I wait 5s
#    Given I fill id "clear" with "welcome"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I Click id "clear-button"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Search 2
#    When I wait 5s
#    Given I Click id "test-search"
#    When I wait 5s
#    Given I fill "Search in all places" with "welcome"
#    When I wait 5s
#    Given I Click id "test-search-clear"
#    When I wait 5s
#    Given I Click id "test-search"
#    When I wait 5s
#    Given I fill "Search in all places" with "welcome"
#    Given I press enter
#    When I wait 5s
#    When I wait 5s
#    Given I clear input by id "clear"
#    When I wait 5s
#    Given I fill id "clear" with "welcome"
#    When I wait 5s
#    Given I Click id "button-search"
#    When I wait 5s
#    Given I Click id "clear-button"
#    When I wait 5s
#    Then should the title of the place be "All Places"

