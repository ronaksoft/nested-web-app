Feature: Post-view and Derivatives

  Scenario: Login user with true info
    Given I go to the page "/login"
    When Wait to loading hide
    Given I fill "Username" with "jerry"
    Given I fill "Password" with "111111"
    Given I Press "Sign in"
    Then current tab must be "Feed"


  Scenario: user goes to test-post-view place
    When Wait for hiding of all loadings
    Given I Click on "test-post-view" place in sidebar
    When I wait 5s
    When Wait for hiding of all loadings
    When should the title of the place be "test post view"
    When current tab is "Posts"
    Then must see no posts

  Scenario: user creates a post
    Given I Click input by dataNgModel "ctlCompose.model.subject"
    Given I write "Creating a rich post for testing post view"
    When I wait 1s
    Given I press enter
    When I wait 1s
    Given I write "just click on the http://www.nested.me to direct you to new world"
    Given I Attach dog-png
    Given I Attach xlsx-document
    Given I Attach pdf-document
    Given I Attach music
    When I wait 2s
    When Wait for Upload to be finished
    Given I Click by ngClick "ctlCompose.send()"
    When Wait to see success-msg
    Then must see the created post

  Scenario:
    Given I Click by ngClick "ctlPostCard.viewFull($event); ctlPostCard.markAsRead(); _track('post card','open post view : click date');"
    When Wait see object with id "PostView"
    

  Scenario: signing out
    Given I Click on profile pop-over
    Given I Click on href "signout"
    When I wait 5s
    Then Must see object with id "panel-signin"

