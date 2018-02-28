# SENG513 Assignment 3
## Tanner Hagel
### How to run
Use the following command to run the server, replacing '8080' with the port number you wish to start the server on:
```
PORT=8080 nodejs assignment3.js
```

### Functionality
The following functionality exists:
* Desktop Version
  * Instant messaging chat
  * Chat history
    * Chat is logged in memory. Server resets will reset the history.
  * Anonymous users
    * Users are tracked via session cookies on the client. If the cookie is lost, the server will give the browser a new cookie with a new user ID. If the server resets when the client is connected, the client will re-write it's current cookie with the new user ID.
  * Online users
    * Shows a list of users currently in your room.
  * Nicknames
    * Change nicknames using one of the commands: '/n', '/nick', '/nickname'.
    * Nicknames must be unique. Capitalization does not matter.
  * Timestamps
    * Timestamps are recorded according to server time.
  * Rooms
    * Users are able to join different rooms
    * Currently only one room per connection. To access multiple rooms, multiple browsers will be required (new tab or window).
* Mobile Version
  * FEATURES TO BE LISTED
