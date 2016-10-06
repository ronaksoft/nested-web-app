Feature: User: mapping
  As a user of Nested
  I should be able to click on any clickable icons and go to the related page

  Scenario: Mapping
    Given I go to the page "/login"
    When I wait 10s
    Given I fill "Username" with "test-mapping"
    Given I fill "Password" with "123456"
    Given I Press "Sign in"
    When I wait 10s
    Then should the title of the place be "All Places"


  Scenario:
    Given I Click Link by Partial Text "Activity"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Sent"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Bookmark"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "All Places"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "test mapping"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Setting"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Add a sub-place"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Discard"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Delete"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Cancel"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text "Activity"
    When I wait 5s

  Scenario:
    Given I Click Link by Partial Text ""
    When I wait 5s


#
#  Scenario:
#    Given I Click Link by Partial Text "Create New Grand Place"
#    When I wait 5s
