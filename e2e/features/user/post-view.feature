#Feature: Post-view and Derivatives
#
#  Scenario: Login user with true info
#    Given I go to the page "/login"
#    When Wait to loading hide
#    Given I fill "Username" with "jerry"
#    Given I fill "Password" with "123456"
#    Given I Press "Sign in"
#    Then current tab must be "Feed"
#
#
#  Scenario: user goes to test-post-view place
#    When Wait for hiding of all loadings
#    Given I Click on "test-post-view" place in sidebar
#    When I wait 1s
#    When Wait for hiding of all loadings
#    When should the title of the place be "test post view"
#    When current tab is "Posts"
#    Then must see no posts
#
#  Scenario: user creates a post
#    Given I Click input by dataNgModel "ctlCompose.model.subject"
#    Given I write "Creating a rich post for testing post view"
#    When I wait 1s
#    Given I press enter
#    When I wait 1s
#    Given I write "just click on the http://www.nested.me to direct you to new world"
##    Given I Attach dog-png
##    Given I Attach xlsx-document
##    Given I Attach pdf-document
##    Given I Attach music
##    When I wait 10s
#    When Wait for Upload to be finished
#    Given I Click by ngClick "ctlCompose.send()"
#    When Wait to see success-msg
#    Then must see at least one post
#
##  Scenario: reply and foreward
##    Given I Click by ngClick "ctlPostCard.viewFull($event); ctlPostCard.markAsRead(); _track('post card','open post view : click date');"
##    When Wait see object with id "PostView"
##    Given I Click by ngClick "ctlPostCard.replyAll($event);ctlPostCard.markAsRead(); _track('post card', 'reply : add-on');"
##    When Wait see object with class "compose-wrp"
##    When I wait 5s
##    When should see "test post view" place name
##    When Wait to see subject "Creating a rich post for testing post view"
##    When I wait 5s
##    Given I Click by ngClick "$dismiss()"
##    When I wait 5s
##    When Wait see object with id "delete-view"
##    When I wait 5s
##    Given I Click by ngClick "$close(true);"
###    When Wait see object with id "PostView" ----------------check----------------
##    Given I Click by ngClick "ctlPostCard.viewFull($event); ctlPostCard.markAsRead(); _track('post card','open post view : click date');"
##    When Wait see object with id "PostView"
##    Given I Click by ngClick "ctlPostCard.forward($event);ctlPostCard.markAsRead(); _track('post card', 'forward : add-on');"
##    When should the body of the compose be "just click on the http://www.nested.me to direct you to new world"
###    When Wait to see image
###    When Wait to see document
###    When Wait to see music
###    When Wait to see pdf
##    Given I Click by ngClick "$dismiss()"
##    When Wait see object with id "delete-view"
##    Given I Click by ngClick "$close(true);"
##    Given I pin a post
##    When I wait 2s
##    Then post must be pinned
##
###  Scenario: close the post view and go to bookmarks page
###    Given I Click by ngClick "$dismiss()"
###    When should the title of the place be "test post view"
###    When current tab is "Posts"
###    Given I Click on href "feed"
###    When current tab is "Feed"
###    Given I switch to "bookmarks" tab
###    When current tab is "Bookmarks"
###    Then must see the bookmarked post
###
###  Scenario: unpin the post
###    Given I unpin a post
###    When I wait 2s
###    Then must see no posts
###
###  Scenario: back to post view and attach the post to "test attach place"
###    Given I Click on "test-post-view" place in sidebar
###    When I wait 5s
###    When Wait for hiding of all loadings
###    When should the title of the place be "test post view"
###    When current tab is "Posts"
###    Given I Click by ngClick "ctlPostCard.viewFull($event); ctlPostCard.markAsRead(); _track('post card','open post view : click date');"
###    Given I Click by ngClick "_track('post card', 'more options');"
###    Given I Click by ngClick "ctlPostCard.attachPlace();"
###    When Wait see object with class "attach-place nst-modal"
###    Given I fill "Enter a Place name or a Nested address..." with "test attach place"
###    When I wait 2s
###    Given I press enter
###    Given I Press "Attach the Place"
###    When Wait to see success-msg
###
###  Scenario: now remove the post from first place
###    Given I Click by ngClick "ctlPostCard.viewFull($event); ctlPostCard.markAsRead(); _track('post card','open post view : click date');"
###    Given I Click by ngClick "_track('post card', 'more options');"
###    Given I Click by ngIf "ctlPostCard.placesWithRemoveAccess.length > 0"
###    Given I Click by ngClick "ctlPostCard.move(place)"
###    When Wait see object with class "move-place"
###    Given I fill "find place" with "test-attach-place"
###    Given I Click by ngClick "ctrl.setTargetPlace(place)"
###    Given I Click by ngIf "ctrl.targetPlace"
###    When Wait to see success-msg
#
#  Scenario: signing out
#    Given I Click on profile pop-over
#    Given I Click on href "signout"
#    When I wait 5s
#    Then Must see object with id "panel-signin"
#
