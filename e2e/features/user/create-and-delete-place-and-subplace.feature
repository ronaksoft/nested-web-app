#Feature: Create and Delete a place or subplace
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"

 #TODO delete place is not working

#  Scenario: jerry create a place
#    Given I Click by ngClick "ctlSidebar.openCreatePlaceModal($event);"
#    When Wait see object with id "create-place"
#    When Wait to see create place step "1"
#    Given I Attach dog-png
#    When Wait see object with id "change-pic"
#    Given I Press "Done"
#    Given I fill input by name "placeName" with "test create place name"
#    When I wait 5s
#    Given I Click icon by class "_24svg _df _fn edit-icon"
#    When I wait 1s
#    When Wait see object with id "change-view"
#    When I wait 1s
#    Given I clear input by name "name"
#    When I wait 1s
#    Given I fill input by name "name" with "test-create-place-id"
#    When I wait 1s
#    Given I Press "Save"
#    Given I fill input by ngModel "ctrl.place.description" with "test for create place"
#    Given I Press Next
#    When Wait to see create place step "2"
#    Given I Press button by ngClick "ctrl.save()"
#    When I wait 5s
#    When Wait to see create place step "3"
#    Given I Click by ngClick "$dismiss()"
#    When should the title of the place be "test create place name"
#    Then current tab must be "Posts"

#  Scenario: jerry delete the created place
#    When I wait 5s
#    Given I Click on "test-create-place-id" place in sidebar
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When should the title of the place be "test create place name"
#    Given I Click Triple-dot
#    When I wait 2s
#    Given I Click id "comments"
#    When I wait 2s
#    Given I Click by ngClick "ctlFullNavbar.confirmToRemove()"
#    When I wait 5s
#    When Wait see object with id "delete-view"
#    When I wait 5s
#    Given I Click by ngClick "nextStep =! nextStep; focusInput=true"
#    When I wait 1s
#    Given I fill "Place ID" with "test-create-place-id"
#    When I wait 1s
#    Given I Click by ngClick "$close();"
#    When I wait 1s
#    When Wait to see success-msg
#    When I wait 1s
#    Then current tab must be "Feed"

#  Scenario:
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"

