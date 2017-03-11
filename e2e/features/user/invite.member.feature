#Feature: checking invitation,add and remove member flow
#
#      #TODO waiting for ehsan to fix searchable option issue
#
#    Scenario: kayvan signs in
#      Given I go to the page "/login"
#      When Wait to loading hide
#      Given I fill "Username" with "kayvan"
#      Given I fill "Password" with "1234"
#      Given I Press "Sign in"
#      Then current tab must be "Feed"
#
#    Scenario: kayvan goes to "hardware" place
#      When I wait 10s
#      Given I Click on "hardware" place in sidebar
#      Then should the title of the place be "hardware"
#
#    Scenario: invites ewyer
#      When Wait for hiding of all loadings
#      Given I Click by ngClick "ctlTeammates.addMember()"
#      When Wait to see invite-modal
#      Given I fill recipient with "ewyer"
#      When I wait 2s
#      Given I press enter
#      Given I Click by ngClick "addMemberCtrl.add();"
#      Then invite modal must hide
#
#    Scenario: add him to "first"
#
#
#    Scenario: kayvan signs out
#      Given I Click on profile pop-over
#      Given I Click on href "signout"
#      When I wait 5s
#      Then Must see object with id "panel-signin"
