# Custom Discord Rich Presence for cli use.

###### For this program to work you a Discord instance must be open on your computer...

##### For global installation please do a 777 recursive chmod to `/usr/local/lib/node_modules/custom-discord-rp/` Command for UNIX: `sudo chmod -R 777 /usr/local/lib/node_modules/custom-discord-rp/`

The first time you give a token, he is placed in a `./config.json` file at the project root folder.

---

###### To use this cli project you need to have a Client ID and to preimport assets.

### How to get a Client ID:

-   For this you need to go to the [Discord Developers Portal](https://discord.com/developers/applications/), login with a discord account and create a new application.
-   Copy the Client ID:

-   Then run `npx custom-drp`

### How to import assets:

-   Go to the [Discord Developers Portal](https://discord.com/developers/applications/)

-   In the application you've created, select Rich Presence and then Art Assets...

-   You can now import photos and give them an asset key that you will use to select your photo in the `custom-drp` cli project.

---

For any problem, please create an issue...

This project is maintained by: @MrNossiom
