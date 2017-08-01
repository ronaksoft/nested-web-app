#Feature: User: Profile setting
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "user-8"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: user goes to profile page and start changing
#    Given I Click by ngClick "ctlSidebar.profileOpen =! ctlSidebar.profileOpen;ctlSidebar.mentionOpen = false;$event.preventDefault();$event.stopPropagation()"
#    When Wait see object with class "popover-content"
#    Given I Click on href "settings/profile"
#    When Wait see object with class "panel-profile-menu"
#    Given I Attach dog-png
#    When Wait see object with id "change-pic"
#    Given I Press "Done"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-change-name.html"
#    When Wait see object with id "change-view"
#    Given I clear input by name "firstName"
#    Given I fill input by name "firstName" with "edited-jerry"
#    Given I clear input by name "lastName"
#    Given I fill input by name "lastName" with "edited-mc"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-change-email.html"
#    When Wait see object with id "change-view"
#    Given I clear input by name "email"
#    Given I fill input by name "email" with "jerry@ronaksoftware.com"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-change-dob.html"
#    When Wait see object with id "change-view"
#    Given I clear input by name "inlineYear"
#    Given I fill input by name "inlineYear" with "1900"
#    Given I Click by ngModel "month"
#    Given I Click Option by Label "March"
#    Given I Click by ngModel "day"
#    Given I Click Option by Label "23"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-select-gender.html"
#    Given I Click by ngModel "gender"
#    Given I Click Option by Label "Female"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#
#  Scenario: user change the old password
#    Given I Click on href "settings/password"
#    Given I fill input by name "oldPassword" with "123456"
#    Given I fill input by name "newPassword" with "111111"
#    Given I fill input by name "newPasswordConfirm" with "111111"
#    Given I Click input by value "Change"
#    When Wait to see success-msg
#    Given I Click id "Logo"
#    Then current tab must be "Feed"
#
#  Scenario: User Signs out
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 1s
#    Then Must see object with id "panel-signin"
#
#  Scenario: user login with changed password
#    Given I fill "Username" with "user-8"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#  Scenario: user goes to profile page and start changing
#    Given I Click by ngClick "ctlSidebar.profileOpen =! ctlSidebar.profileOpen;ctlSidebar.mentionOpen = false;$event.preventDefault();$event.stopPropagation()"
#    When Wait see object with class "popover-content"
#    Given I Click on href "settings/profile"
#    When Wait see object with class "panel-profile-menu"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-change-name.html"
#    When Wait see object with id "change-view"
#    Given I clear input by name "firstName"
#    Given I fill input by name "firstName" with "jerry"
#    Given I clear input by name "lastName"
#    Given I fill input by name "lastName" with "mc"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-change-email.html"
#    When Wait see object with id "change-view"
#    Given I clear input by name "email"
#    Given I fill input by name "email" with "jerry@ronaksoftware.com"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-change-dob.html"
#    When Wait see object with id "change-view"
#    Given I clear input by name "inlineYear"
#    Given I fill input by name "inlineYear" with "1990"
#    Given I Click by ngModel "month"
#    Given I Click Option by Label "June"
#    Given I Click by ngModel "day"
#    Given I Click Option by Label "22"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#    Given I Click edit-icon by open-custom-modal "app/settings/profile/modals/profile-select-gender.html"
#    Given I Click by ngModel "gender"
#    Given I Click Option by Label "Female"
#    Given I Press "Save"
#    When I wait 1s
#    When Wait see object with class "profile-section"
#
#  Scenario: user change the old password
#    Given I Click on href "settings/password"
#    Given I fill input by name "oldPassword" with "111111"
#    Given I fill input by name "newPassword" with "123456"
#    Given I fill input by name "newPasswordConfirm" with "123456"
#    Given I Click input by value "Change"
#    When Wait to see success-msg
#    Given I Click id "Logo"
#    Then current tab must be "Feed"
#
#  Scenario: sign out
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When Wait to loading hide
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
