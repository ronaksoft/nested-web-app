Feature: User: mapping
  As a user of Nested
  I should be able to click on any clickable icons and go to the related page

  Scenario: Sign in Mapping
    When I wait 5s
    Given I go to the page "/login"
    When I wait 5s
    Given I fill "Username" with "test-mapping"
    When I wait 5s
    Given I fill "Password" with "123456"
    When I wait 5s
    Given I Press "Sign in"
    When I wait 5s
    Then should the title of the place be "All Places"

  Scenario: Activity page mapping
    When I wait 5s
    Given I Click Link by Partial Text "Activity"
    When I Wait till line loader hide
    When I wait 5s
    Then should the title of the place be "All Places"

  Scenario: Sent page mapping
    When I wait 5s
    When I wait 5s
    Given I Click on "sent" in sidebar
    When I Wait till line loader hide
    When I wait 5s
    Then should the title of the place be "Sent"

  Scenario: Bookmark page mapping
    When I wait 5s
    Given I Click on "bookmarks" in sidebar
    When I Wait till line loader hide
    When I wait 2s
    Then should the title of the place be "Favorite Places"

  Scenario: Change page mapping
    When I wait 5s
    Given I Click on sidebar "messages"
    When I Wait till line loader hide
    When I wait 5s
    Given I Click on "sent" in sidebar
    When I Wait till line loader hide
    When I wait 5s
    Then should the title of the place be "Sent"

  Scenario: test mapping of a place page
    When I wait 5s
    Given I Click on "sent" in sidebar
    When I Wait till line loader hide
    When I wait 5s
    Given I Click Link by Partial Text "test-mapping@nested.me"
    When I Wait till line loader hide
    When I wait 2s
    Then should the title of the place be "test mapping"

  Scenario: Setting page mapping: create a sub-place 1
    When I wait 5s
    Given I Click id "navbar-popover"
    When I wait 5s
    Given I Click Link by Partial Text "Create a sub-place"
    When I wait 5s
    Given I Click id "close-create-place"
    When I wait 5s
    Given I Click id "navbar-popover"
    When I wait 5s
    Given I Click Link by Partial Text "Create a sub-place"
    When I wait 5s
    Given I fill "Marketing Development" with "test-sub-place180"
    When I wait 5s
    Given I Click id "PlaceID"
    When I wait 5s
    Given I clear input by id "change-place-id"
    When I wait 5s
    Given I fill id "change-place-id" with "test500"
    When I wait 5s
    Given I Click id "change-save"
    When I wait 5s
    Given I Click label by for "notification"
    When I wait 5s
    Given I Click label by for "favo"
    When I wait 5s
#    Given I Click id "submit-place"
#    When I wait 5s
    Given I Click id "close-create-place"


#    Given I Click Link by Partial Text "Discard"
#    When I wait 5s
#    When I Wait till line loader hide
#    Then should the title of the place be "test mapping"
##
##  Scenario: Delete place
##    Given I Click Link by Partial Text "Delete"
##    When I Wait till line loader hide
##    When I wait 5s
##    Given I Click Link by Partial Text "Cancel"
##    When I wait 5s
##    When I Wait till line loader hide
##    Then should the title of the place be "test mapping"//
#
#  Scenario: Create a place mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Activity"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click Link by Partial Text "Create New Grand Place"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "Add Place"
#
#  Scenario: Discard
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 2s
#    Then should the title of the place be "All Places"
#
#  Scenario: Compose mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Compose"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard Compose mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Edit my profile mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "@test-mapping"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click Link by Partial Text "Edit My profile"
#    When I wait 5s
#    Then should the title of the place be "Profile"
#
#  Scenario: Change password mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Change Password"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click Link by Partial Text "Back"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "Profile"
#
#    Given I Click Link by Partial Text "All Places"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Postcard Reply all mapping
#    When I wait 5s
#    Given I Click Link by Partial Text "Messages"
#    When I wait 5s
#    Given I Click id "test-reply"
#    When  I wait 5s
#    Given I Click Link by Partial Text "Reply all"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: Postcard Reply Sender mapping
#    When I wait 5s
#    Given I Click id "test-reply"
#    When  I wait 5s
#    Given I Click Link by Partial Text "Reply sender"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 2s
#    Then should the title of the place be "All Places"
#
#  Scenario: Postcard forward
#    When  I wait 5s
#    Given I Click id "test-forward"
#    When I Wait till line loader hide
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Postcard
#    When I wait 5s
#    Given I Click id "test-post-card-badge"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Given I Click Link by Partial Text "All Places"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Given I Click id "test-post-card-badge-no"
#    When  I wait 5s
#    Given I Click Link by Partial Text "ronaksoft"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click Link by Partial Text "All Places"
#    When I wait 5s
#    Given I fill "write your comment ..." with "welcome"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    Given I Click id "test-post-view"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click id "test-post-view-reply"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply all"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Post view Reply sender
#    When  I wait 5s
#    Given I Click id "test-post-view"
#    When I wait 5s
#    Given I Click id "test-post-view-reply"
#    When I wait 5s
#    Given I Click Link by Partial Text "Reply sender"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Close Post-view
#    When  I wait 5s
#    Given I Click id "test-post-view"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click id "test-post-view-close"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Post view forward
#    When  I wait 5s
#    Given I Click id "test-post-view"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click id "test-post-view-forward"
#    When I wait 5s
#    Then should the title of the place be "Compose"
#
#  Scenario: Discard
#    When  I wait 5s
#    Given I Click Link by Partial Text "Discard"
#    When I Wait till line loader hide
#    When  I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Post view
#    When  I wait 5s
#    Given I Click Link by Partial Text "Bookmarks"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click id "test-post-view"
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I Click id "test-post-badge"
##    //Given I Click Link by Partial Text "sina Hoseini"//
#    When I wait 5s
##    //Given I Click Link by Partial Text "Return"//
#    When I wait 5s
#    When  I wait 5s
#    Given I Click Link by Partial Text "All Places"
#    When  I wait 5s
#    Given I Click id "test-post-view"
#    When  I wait 5s
#    When I Wait till line loader hide
#    When I wait 5s
#    Given I fill textarea by "write your comment..." with "test"
#    When I wait 5s
#    Given I press enter
#    When I wait 5s
#    When I wait 5s
#    Given I Click Link by Partial Text "delete"
#    When I wait 5s
#    Given I Click id "test-post-view-close"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#  Scenario: test filter bar
#    When  I wait 5s
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
#    Given I Click label by for "content"
#    When I wait 5s
#    Given I Click label by for "attachments"
#    When I wait 5s
#    Given I Click label by for "comments"
#    Then should the title of the place be "All Places"
#
#
#
#
#
#
#
#
#
