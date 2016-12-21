#Feature: User: mapping
#  As a user of Nested
#  I should be able to click on any clickable icons and go to the related page
#
#  Scenario: Sign in Mapping
#    When I wait 5s
#    Given I go to the page "/login"
#    When I wait 5s
#    Given I fill "Username" with "test-mapping"
#    When I wait 5s
#    Given I fill "Password" with "123456"
#    When I wait 5s
#    Given I Press "Sign-in"
#    When I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Activity page mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Activities"
#    When I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Favorite Feed page mapping
#    When I wait 5s
#    Given I Click on switchDrag "ctlFullNavbar.toggleFeed" on navbar
#    When I wait 2s
#    Then should the title of the place be "Favorite Feed"
#
#  Scenario: Sent page mapping
#    When I wait 5s
#    Given I Click on "sent" in sidebar
#    When I wait 5s
#    Then should the title of the place be "Sent"
#
#  Scenario: Change page mapping
#    When I wait 5s
#    Given I Click on sidebar "messages"
#    When I wait 5s
#    Given I Click on "sent" in sidebar
#    When I wait 5s
#    Then should the title of the place be "Sent"
#
#  Scenario: test mapping of a place page
#    When I wait 5s
#    Given I Click on "sent" in sidebar
#    When I wait 5s
#    Given I Click Link by Partial Text "test-mapping@nested.me"
#    When I wait 2s
#    Then should the title of the place be "test mapping"
#
#  Scenario: Compose mapping
#    When I wait 5s
#    Given I Click on sidebar "compose"
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard Compose mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I wait 5s
#    Then should the title of the place be "test mapping"
#
#  Scenario: Edit my profile mapping
#    When I wait 5s
#     Given I Click on "ronaksoft" place
#    When I wait 5s
#    Given I Click on sidebar "profile"
#    When I wait 5s
#    Then should the title of the place be "Profile"
#
#  Scenario: Change password mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Change your password"
#    When I wait 5s
#    Given I Click Link by Partial Text "Back to Profile"
#    When I wait 5s
#    Then should the title of the place be "Profile"
#
#    Scenario: Save and Exit
#     Given I Click input by value "Save & Exit"
#    When I wait 5s
#    Then should the title of the place be "Ronak Software Group"
#
#  Scenario: Postcard Reply all mapping
#    When I wait 5s
#    Given I Click on sidebar "messages"
#    When I wait 5s
#    Given I Click Link by Partial Text "comment"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Given I Click icon by tooltip "Reply to all"
#    When  I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When  I wait 5s
#    Then should the title of the place be "Feed"
#
#
#  Scenario: Postcard Reply Sender mapping
#    When I wait 5s
#    Given I Click icon by tooltip "Forward"
#    When  I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When  I wait 2s
#    Then should the title of the place be "Feed"
#
#  Scenario: Postcard forward
#    When  I wait 5s
#    Given I Click by ngClick "$event.stopPropagation()"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply to sender"
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When  I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Postcard
#    When I wait 5s
#    Given I Click Link by Partial Text "Ronak Software Group"
#    When  I wait 5s
#    Given I Click on sidebar "messages"
#    When  I wait 5s
#    Given I Click Link by Partial Text "+2"
#    When  I wait 5s
#    Given I Click Link by Partial Text "ronaksoft"
#    When I wait 5s
#    Given I Click on sidebar "messages"
#    When I wait 5s
#    Given I fill "write your comment ..." with "welcome"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    Given I Click id "reply-post-view"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply all"
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When  I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Post view Reply sender
#    When  I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    Given I Click id "reply-post-view"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply sender"
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When  I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Close Post-view
#    When  I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When  I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Post view forward
#    When  I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    Given I Click Link by Partial Text "Forward"
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When  I wait 5s
#    Then should the title of the place be "Feed"
#
#  Scenario: Post view
#    When  I wait 5s
#    Given I Click on sidebar "messages"
#    When I wait 5s
#    Given I Click by ngClick "openPostModal(post)"
#    When I wait 5s
#    Given I Click Link by Partial Text "Ronak Software Group"
#    When I wait 5s
#    Given I Click on sidebar "messages"
#    When  I wait 5s
#    Given  I Click by ngClick "openPostModal(post)"
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
#    Then should the title of the place be "Feed"
#
#
#  Scenario: test filter bar
#    When  I wait 5s
#    Given I move mouse on hidden popover "popoverSortShow"
#    When I wait 5s
#    Given I Click Link by Partial Text "Latest Messages"
#    When I wait 5s
#    Given I Click id "test-filter-sort"
#    When I wait 5s
#    Given I Click id "test-filter-sort"
#    When I wait 5s
#    Given I Click Link by Partial Text "Latest Activity"
#    When I wait 5s
#    Given I Click id "test-filter-setting"
#    When I wait 5s
#    Given I Click id "test-filter-setting"
#    When I wait 5s
#    Given I Click label by for "content"
#    When I wait 5s
#    Given I Click label by for "attachments"
#    When I wait 5s
#    Given I Click label by for "comments"
#    When I wait 5s
#    Then should the title of the place be "Feed"
#
#
#
#
#
#
#
#
#
