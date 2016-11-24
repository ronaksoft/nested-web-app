#Feature: User: Activity
#  As a user of Nested
#  I should be able to go activity page and click on any clickable items
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
#
#  Scenario: Activity 1
#    When I wait 5s
#    Given I Click Link by Partial Text "Activity"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: select filter bar
#    When  I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "all"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "messages"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "comments"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "logs"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: setting filter bar
#    When  I wait 5s
#    Given I Click id "test-setting-filter"
#    When I wait 5s
#    Given I Click id "test-setting-filter"
#    When I wait 5s
#    Given I Click Link by Partial Text "Collapsed View"
#    When I wait 5s
#    Given I Click id "test-setting-filter"
#    When I wait 5s
#    Given I Click id "test-setting-filter"
#    When I wait 5s
#    Given I Click Link by Partial Text "Expanded View"
#
#  Scenario: Activity 2
#    When I wait 5s
#    Given I Click Link by Partial Text "Activity"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Activity 3
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "messages"
#    When I wait 5s
#    Given I Click Link by Partial Text "Ronak Software Group"
#    When I wait 5s
#    Then should the title of the place be "Ronak Software Group"
#
#  Scenario: Activity 4
#    When I wait 5s
#    Given I Click Link by Partial Text "3"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click on "ronaksoft" place
#    When I wait 5s
#    Then should the title of the place be "Ronak Software Group"
#
#  Scenario: back to All places
#    Given I Click on sidebar "messages"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: back to Activity
#    When I wait 5s
#    Given I Click Link by Partial Text "Activity"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Activity 5
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "comments"
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    When I wait 5s
#    Given I Click Link by Partial Text "Forward"
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Activity 6
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "comments"
#    When I wait 5s
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    When I wait 5s
#    Given I Click id "reply-modal-post"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply all"
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Activity 7
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "comments"
#    When I wait 5s
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    When I wait 5s
#    Given I Click id "reply-modal-post"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply sender"
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Activity 8
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "comments"
#    When I wait 5s
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Activity 9
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "test-select-filter"
#    When I wait 5s
#    Given I Click id "comments"
#    When I wait 5s
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "test"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    When I wait 5s
#    Given I Click Link by Partial Text "delete"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Activity 8
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    Given I Click Link by Partial Text "Ronak Software Group"
#    When I wait 5s
#    Then should the title of the place be "Ronak Software Group"
