#Feature: User: login
#  As a user of Nested
#  I should be able to create a new place
#
#  Scenario: Login user with invalid username
#
#    Given I go to the page "/login"
#    When I wait 5s
#    Given I fill "Username" with "test1"
#    When I wait 2s
#    Given I fill "Password" with "111111"
#    When I wait 2s
#    Given I Press "Sign in"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Create a place from sidebar; state 1
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
#  Scenario: Delete grand place
#    Given I Click on "create14" place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "create14"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Create a place from sidebar; state 2
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
#    Given I Click by ngClick "ctlCreate.setReceivingMembers();"
#    When I wait 5s
#    Given I Click label by for "pub-res"
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
#  Scenario: Delete grand place
#    Given I Click on "create14" place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "create14"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
#  Scenario: Create a place from sidebar; state 3
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
#    Given I Click by ngClick "ctlCreate.setReceivingEveryone();"
#    When I wait 5s
#    Given I Click label by for "res"
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
#  Scenario: Delete grand place
#    Given I Click on "create14" place
#    When I wait 5s
#    Given I Click id "navbar-popover"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete"
#    When I wait 5s
#    Given I Click Link by Partial Text "Delete Place"
#    When I wait 5s
#    Given I fill "Place ID" with "create14"
#    When I wait 5s
#    Given I Click Link by Partial Text "DELETE"
#    When I wait 5s
#    Then should the title of the place be "All Places"
#
