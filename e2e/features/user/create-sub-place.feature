#Feature: User: login
#  As a user of Nested
#  I should be able to create a sub-place
#
#  Scenario: Login user with invalid username
#
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
#
#  Scenario: personal place
#    Given I Click on "test-mapping" place
#    When I wait 5s
#    Then should the title of the place be "test mapping"
#
#
#  Scenario: create a sub-place in personal place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create a Personal place"
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-personal-sub-place"
#    When I wait 5s
#    Given I Click by ngClick "ctlCreate.changeId(ctlCreate.place.id)"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "testhaaa132132"
#    When I wait 5s
#    Given I Click by ngClick "$close('ok')"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    Given I Press button "submit"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "test-personal-sub-place"
#
#
#  Scenario: Delete a sub-place of personal place
#
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "test-mapping.test23"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#
#    Scenario: create a open sub-place; state 1: create a place
#
#    Given I Click on plus of "create" in sidebar
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-create-place14"
#    When I wait 5s
#    Given I Click id "PlaceID"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "create14"
#    When I wait 5s
#    Given I Click id "change-save"
#    When I wait 5s
#    Given I Click by ngClick "ctlCreate.setReceivingOff();"
#    When I wait 5s
#    Given I Click Option by value "everyone"
#    When I wait 5s
#    Given I Click by ngModel "ctlCreate.place.policy.addPlace"
#    When I wait 5s
#    Given I Click id "member-create-sub-place-access"
#    When I wait 5s
#    Given I Click by ngModel "ctlCreate.place.policy.addMember"
#    When I wait 5s
#    Given I Click id "member-add-access"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    When I wait 5s
#    Given I Click id "submit-place"
#    When I wait 5s
#    Given I Click id "close-setting-place"
#    When I wait 5s
#    Then should the title of the place be "test-create-place14"
#
#  Scenario: create a open sub-place; state 2: create a open sub-place
#
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create an Open Place"
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-open-sub-place"
#    When I wait 5s
#    Given I Click by ngClick "ctlCreate.changeId(ctlCreate.place.id)"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "testhaaa132132"
#    When I wait 5s
#    Given I Click by ngClick "$close('ok')"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    Given I Press button "submit"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "test-open-sub-place"
#
#  Scenario: Delete the created sub-place
#
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "test-mapping.test23"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: create a open sub-place; state 2: create a close sub-place
#
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Create an Open Place"
#    When I wait 5s
#    Given I fill "Marketing Development" with "test-open-sub-place"
#    When I wait 5s
#    Given I Click by ngClick "ctlCreate.changeId(ctlCreate.place.id)"
#    When I wait 5s
#    Given I clear input by id "change-place-id"
#    When I wait 5s
#    Given I fill id "change-place-id" with "testhaaa132132"
#    When I wait 5s
#    Given I Click by ngClick "$close('ok')"
#    When I wait 5s
#    Given I Click label by for "notification"
#    When I wait 5s
#    Given I Click label by for "favo"
#    When I wait 5s
#    Given I Press button "submit"
#    When I wait 5s
#    Given I Click by ngClick "$dismiss()"
#    When I wait 5s
#    Then should the title of the place be "test-open-sub-place"
#
#  Scenario: Delete the created sub-place
#
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "test-mapping.test23"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
