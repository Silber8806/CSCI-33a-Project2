# Project 1

Web Programming with Python and JavaScript

## Set-up

1. Install packages in requirements.md
2. add a .env file with the following content:

    ```
    FLASK_APP="application.py"
    ```

3. flask run --no-reload

## Website Layout 

The website is a chat application (SPA) that mimics features from slack including:
* background-color and color scheme: purple, grey and white.
* webpage layout: channel, messages, message bar and top nav bar are all in the same place.
* message format: picture, timestamp and message content have a similar structure.
* The indications for active channel: blue background on channel bar and channel showing up in top left
corner.
* application behavior for messaging.  If you submit a message it goes to the bottom of the page.
* application behavior for receiving messages.  If you are at the bottom of the page, it follows the message.
if you are not at the bottom of the page, it doesn't scroll down.
* when receiving new messages on a channel you are not viewing, it highlights the channel in white and bold.
It also adds an * to the title bar, which is only removed when all channels with unread messages are clicked. 
* You can delete posts.

There are some major differences as well:
* Login occurs if username is not stored in LocalStorage.  It will freeze everything until you sign in.
* Channels are defined by clicking add channel and adding them directly to the channel.  You don't post channels.
* Messages do not collapse into previous message if written by the same person (didn't have time to implement)
* I use for Avatars adorable.io faces, example here: https://api.adorable.io/avatars/640/stranger@hipster.png.
* Delete button is different and when you press it, there is a nice transition effect borrowed from class.
* I exchanged the hash symbol for channel with a speaker symbol.  I used a coffee icon for the title icon.

Other things:
* I use rooms to segregate messages for socket.io.
* originally, I used templates and had 404/500 routes.  Then I decided last minute to refactor to a single page
and have all pages outside of /channels (post) redirect to it.  Why templating when it's a SPA.

## List of Personal Touches
* I use avatars from adorable.io for posts whose urls are constructed based on the username.
* I added message functionality that forced the user to the bottom of the page if message was typed or 
if the message was received and the user was already at the bottom of the page (not scrolling up).
* I added a system to show users if messages were received on channels they are not viewing including
highlighting the channel and adding a star to the title bar.
* You can delete messages and the messages have a cool transition effect.
* Channels are resorted if you exit the browser and re-enter the website.

## Long List of improvements

1. I completed the entire app before Wednesday and hadn't heard about the handlebar templates.  By this time,
I had decided to just clone a hidden element for use with adding channels and messages.  My next step would
be to convert: messages, channel and login form to use handlebar templates.
2. I should add some error messages.  Originally, I followed slacks example where they just wouldn't let you type
characters for channels or usernames that they didn't support.  It would be worth adding flash mentioning for
events in general (like someone logged in etc).
3. Channel currently sorts when you re-open the app.  I wanted to implement a binary search to insert the new
channel into the channels section.  That way it's always sorted by default.  I decided to work on new features
instead of pursuing this.
4. The Flask app stores everything as a dictionary of lists.  If I wanted to add more features, I would have to
optimize this.  It started becoming a pain point when I implemented deletes.  I realized I'd be better served with
a unique set of message IDs as well.
5. I think at some point, I would add Flask events for connect and disconnect.  Add a users logged in and 
logged out information to certain channels (this person left channel etc).  This would slowly lead to user-to-user
direct messaging.  This would have been a much larger project if I added this and felt the above personal touches
worked.
6. I might get rid of index.html and rename the layouts as  index.html.  It's a single page app with no other
webpages.
7. scss might need some minor refactors...add a few variables etc.

## NOTE:

Python and HTML code was run through a formatter and should be consistent.

## Files 
The below will show you the output of the directory as a tree structure.  I've added comments about files below:

Command:

```tree /f```

Output:
```
C:.
│   .env -> environment file
│   application.py -> python application
│   README.md -> this file
│   requirements.txt -> requirements file...includes one library extra dotenv
│   run.sh -> quick script for me to run server
│
├───static
│   ├───css
│   │       styles.css -> styles compiled from styles.scss
│   │       styles.css.map -> the map from above
│   │       styles.scss -> styles sheet I created for this project using SASS
│   │
│   ├───images
│   │       cool_cat.jpg -> cool cat photo
│   │       delete_message.png -> delete button used in app
│   │       happy-java.png -> The icon used in the title bar
│   │
│   └───js
│           chat.js -> the actual chat app, a JavaScript file that defines all the behavior
├───templates
│       index.html -> The entire app has been refactored into this single page

```

Note I trimmed the output of the command to not include temporary files.


## Some Notes:

#### CSS and JavaScript Notes

## sources
