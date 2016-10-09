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
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Activity page mapping
#    Given I Click Link by Partial Text "Activity"
#    When I Wait till line loader hide
#    Then should the title of the place be "All Places"
#
#  Scenario: Sent page mapping
#    Given I Click Link by Partial Text "Sent"
#    When I Wait till line loader hide
#    Then should the title of the place be "All Places"
#
#  Scenario: Bookmark page mapping
#    Given I Click Link by Partial Text "Bookmark"
#    When I Wait till line loader hide
#    When I wait 2s
#    Then should the title of the place be "Bookmarks"
#
#  Scenario: Change page mapping
#    Given I Click Link by Partial Text "All Places"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Sent"
#    When I Wait till line loader hide
#    Then should the title of the place be "All Places"

#   Scenario: test mapping of a place page
#   Given I Click Link by Partial Text "test-mapping@nested.me"
#   When I Wait till line loader hide
#   When I wait 2s
#   Then should the title of the place be "test mapping"
#
#   Scenario: Setting mapping page
#   Given I Click Link by Partial Text "Setting"
#   When I Wait till line loader hide
#   When I wait 10s
#   Given I Click Link by Partial Text "Add a sub-place"
#   When I Wait till line loader hide
#   When I wait 10s
#   Given I Click Link by Partial Text "Discard"
#   When I wait 10s
#   When I Wait till line loader hide
#
#  Scenario: Delete place
#  Given I Click Link by Partial Text "Delete"
#  When I Wait till line loader hide
#  When I wait 10s
#  Given I Click Link by Partial Text "Cancel"
#  When I wait 10s
#  When I Wait till line loader hide

# Scenario: Create a place mapping and compose
#    Given I Click Link by Partial Text "Activity"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Create New Grand Place"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Compose"
#    When I Wait till line loader hide
#    Then should the title of the place be "Compose"
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    Then should the title of the place be "All Places"
#
#  Scenario: Edit my profile and change password mapping
#    Given I Click Link by Partial Text "@test-mapping"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Edit My profile"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Change Password"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "Back"
#    When I Wait till line loader hide
#    Given I Click Link by Partial Text "All Places"
#    When I Wait till line loader hide
#    Then should the title of the place be "All Places"

# Scenario: test-postcards
#   Given I Click id "test-reply"
#   When  I wait 5s
#   Given I Click Link by Partial Text "Reply all"
#   When  I wait 5s
#   Given I Click Link by Partial Text "Discard"
#   When  I wait 5s
#   Given I Click id "test-reply"
#   When  I wait 5s
#   Given I Click Link by Partial Text "Reply sender"
#   When  I wait 5s
#   Given I Click Link by Partial Text "Discard"
#   When  I wait 5s
#   Given I Click id "test-post-card-badge"
#   When  I wait 5s
#   Given I Click Link by Partial Text "All Places"
#   When  I wait 5s
#   Given I Click id "test-post-card-badge-no"
#   When  I wait 5s
#   Given I Click Link by Partial Text "ronaksoft"
#   When  I wait 5s
#  //TODO:just comment remained//

#  Scenario: test-post-view-actions
#   Given I Click id "test-post-view"
#   When I wait 5s
#   Given I Click id "test-post-view-reply"
#   When I wait 5s
#   Given I Click Link by Partial Text "Reply all"
#   When I wait 5s
#   Given I Click Link by Partial Text "Discard"
#   When I wait 5s
#   Given I Click id "test-post-view"
#   When I wait 5s
#   Given I Click id "test-post-view-reply"
#   When I wait 5s
#   Given I Click Link by Partial Text "Reply sender"
#   When I wait 5s
#   Given I Click Link by Partial Text "Discard"
#   When I wait 5s
#   Given I Click id "test-post-view"
#   When I wait 5s
#   Given I Click id "test-post-view-close"
#   When I wait 5s
#   Given I Click id "test-post-view"
#   When I wait 5s
#   Given I Click id "test-post-view-forward"
#   When I wait 5s
#   Given I Click Link by Partial Text "Discard"
#   When I wait 5s
#    Given I Click id "test-post-view"
#    When I wait 5s
#    Given I Click id "test-post-badge"
#    When I wait 5s
#    Given I Click Link by Partial Text "Return"
#    When I wait 5s
# //TODO:just comment remained//

# //TODO: correct it//
#  Scenario: test filter bar
#    Given I Click id "test-filter-sort"
#    When I wait 5s
#    Given I Click id "test-filter-sort"
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
#    Given I Click checkbox by Label "content"
#    When I wait 5s
#    Given I Click checkbox by Label "attachments"
#    When I wait 5s
#    Given I Click checkbox by Label "comments"
#    When I wait 5s








