#Feature: User: add and remove cantacts
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "111111"
#    Given I Press "Sign in"
#    When I wait 2s
#    Then the text of this class "_jcc _df _fw nst-margin-12" must be "No Favorite Contact!!"
##
#  Scenario: user add one contact
#    Given I Click on "test-contact" place in sidebar
#    When I wait 2s
#    When should the title of the place be "test contact"
#    When I wait 2s
#    When Wait for hiding of all loadings
#    When current tab is "Posts"
#    Given I Click by ngClick "viewContact()"
#    When Wait see object with id "single-contact"
#    Given I Click by ngClick "ctrl.add()"
#    Given I Click by ngClick "ctrl.close();"
#    When I wait 2s
#    Given I Click on href "feed"
#    When I wait 2s
#    Then the text of this class "_jcc _df _fw nst-margin-12" must be "No Favorite Contact!!"
#
#  Scenario: user add and favorite contact
#    Given I Click by ngClick "ctlMessages.openContacts($event)"
#    When Wait see object with id "contacts-list"
#    When the text of this class "_difv" is "tommy hard,tommy"
#    Given I Click by ngClick "ctrl.view(contact)"
#    When Wait see object with id "single-contact"
#    Given I Click by ngClick "ctrl.toggleFavorite()"
#    Given I Click by ngClick "ctrl.close();"
#    Given I Click by ngClick "$dismiss()"
#    When the text of this class "_df text-wrap _fw contact-item" is "tommy hard"
#    Then current tab must be "Feed"
#
#  Scenario: remove contact
#    Given click first contact
#    When I wait 2s
#    When Wait see object with id "single-contact"
#    When I wait 2s
#    Given I Click by ngIf "ctrl.contact.isContact"
#    Given I Click by ngClick "ctrl.remove()"
#    When I wait 2s
#    Given I Click by ngClick "ctrl.close();"
#    When I wait 2s
#    Then the text of this class "_jcc _df _fw nst-margin-12" must be "No Favorite Contact!!"
#
#   Scenario: sign out
#     Given I Click on profile pop-over
#     Given I Click on href "signout"
#     When Wait to loading hide
#     Given I Click on profile pop-over
#     Given I Click on href "signout"
#     When I wait 5s
#     Then Must see object with id "panel-signin"
