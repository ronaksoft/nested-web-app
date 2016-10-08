Feature: User: mapping
  As a user of Nested
  I should be able to click on any clickable icons and go to the related page

  Scenario: Mapping
    Given I go to the page "/login"
    Given I fill "Username" with "test-mapping"
    Given I fill "Password" with "123456"
    Given I Press "Sign in"
    Then should the title of the place be "All Places"

  Scenario:
    Given I Click Link by Partial Text "Activity"
    When I Wait till line loader hide
    Then should the title of the place be "All Places"

  Scenario:
    Given I Click Link by Partial Text "Sent"
    When I Wait till line loader hide
    Then should the title of the place be "All Places"

  Scenario:
    Given I Click Link by Partial Text "Bookmark"
    When I Wait till line loader hide
    When I wait 2s
    Then should the title of the place be "Bookmarks"

  Scenario:
    Given I Click Link by Partial Text "All Places"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "Sent"
    When I Wait till line loader hide
    Then should the title of the place be "All Places"

# Scenario:
# Given I Click Sidebar Place Name "test mapping"
# When I Wait till line loader hide
# When I wait 2s
# Then should the title of the place be "test mapping"
#
# Scenario:
# Given I Click Link by Partial Text "Setting"
# When I Wait till line loader hide
# When I wait 10s
# Given I Click Link by Partial Text "Add a sub-place"
# When I Wait till line loader hide
# When I wait 10s
# Given I Click Link by Partial Text "Discard"
# When I wait 10s
# When I Wait till line loader hide
#
# Scenario:
# Given I Click Link by Partial Text "Delete"
# When I Wait till line loader hide
# When I wait 10s
# Given I Click Link by Partial Text "Cancel"
# When I wait 10s
# When I Wait till line loader hide
#
# Scenario:
# Given I Click Link by Partial Text "Activity"
# When I wait 10s
# When I Wait till line loader hide

  Scenario:
    Given I Click Link by Partial Text "Create New Grand Place"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "Discard"
    When I Wait till line loader hide

  Scenario:
    Given I Click Link by Partial Text "Compose"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "Discard"
    When I Wait till line loader hide
    Then should the title of the place be "All Places"

  Scenario:
    Given I Click Link by Partial Text "@test-mapping"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "Edit My profile"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "Change Password"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "Back to Profile"
    When I Wait till line loader hide
    Given I Click Link by Partial Text "All Places"
    When I Wait till line loader hide
    Then should the title of the place be "All Places"


# Scenario:
# Given I Click Search Button
# Given I fill "Search in test mapping" with "test mapping"
# When I Click Close Icon
# Then should the Search Input hide


# Scenario:
# Given I Click Search Button
# Given I fill "Search in test mapping" with "Welcome"
# When I press enter
# Then should go to search page with results of Welcome
