# Talkr?

### What is this?

Going to be 100%, I don't actually know. I seem to have a slight obsession with making chat applications that don't have databases (See SocketIOChat) for something similar.



### What's wrong with it?

Security was not a concern when making this, I'm pretty sure there is some path traversal stuff in here...oh and the plaintext md5 string for passwords.

There is no error handling, the server will crash if you ask it to do something it cant, do eg asking for a user profile that does not exist.

### Before starting the sever you will need to add the following folders

- data
- data->accounts
- data->images


## Features

- Contacts
- Private Chat
- Ability to send images
- Ability to serve images from the server



## Things to add

- Non centrally managed account / contacts
- Add JWT expiry
- User self sign up

## Things to do

- General code cleanup

  Some things have been hacked together and can work a lot better with less code

- Some security work

  Since security played no part in this, time to fix

- Server stability

  See the aforementioned server crashes.
