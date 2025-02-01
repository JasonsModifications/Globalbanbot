# Global Ban Bot

## Created by: Jasons Modifications

This is a Discord bot designed to manage global bans across multiple servers. The bot allows staff members to ban/unban users globally, list banned users, and more. It uses a simple and easy-to-understand command system and supports a customizable configuration for various server needs.

## Features
- **Global Ban Command** (`!globalban`): Bans a user from multiple servers.
- **Unban Command** (`!gunban`): Unbans a user from multiple servers.
- **Ban List Command** (`!gbanlist`): Lists all the banned users globally.
- **Help Command** (`!gbanhelp`): Displays help for the bot's commands.
  
## Requirements
- Node.js (v16.x or higher recommended)
- Discord bot token
- Staff role ID with permission to ban/unban users

## Installation

### Step 1: Clone the repository

```bash
git clone https://github.com/JasonsModifications/global-ban-bot.git
cd global-ban-bot
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Set up the configuration file

Rename `config.example.json` to `config.json` and fill in your bot details:

```json
{
  "token": "BotToken",
  "prefix": "!",
  "staffRoleId": "Staff Role ID",
  "serverOwnerName": "Your Name"
}
```

- **`token`**: The bot token obtained from the [Discord Developer Portal](https://discord.com/developers/applications).
- **`prefix`**: The prefix for bot commands (default is `!`).
- **`staffRoleId`**: The role ID that grants permission to use the bot’s commands (e.g., banning/unbanning users).
- **`serverOwnerName`**: Your name or the name you want displayed as the server owner.

### Step 4: Run the bot

```bash
npm start
```

Your bot will now be running and connected to Discord!

## Commands

- **`!globalban <@user> <reason>`**: Bans a user from all servers where the bot has permissions. The user can be mentioned by their Discord ID or username.
- **`!gunban <userID> [reason]`**: Unbans a user globally using their Discord ID.
- **`!gbanlist`**: Displays a list of all globally banned users.
- **`!gbanhelp`**: Displays a help message showing all available commands.

### Permissions Required

The bot checks if the user executing the commands has the `Staff Role ID` assigned. Only users with the staff role will be able to use commands such as banning or unbanning users.

### Example Usage

- **Ban a user**: 
    ```bash
    !globalban @User Reason for ban
    ```

- **Unban a user**:
    ```bash
    !gunban 123456789012345678 Reason if applicable
    ```

- **List banned users**:
    ```bash
    !gbanlist
    ```

- **Help**:
    ```bash
    !gbanhelp
    ```

## License

This bot is made by **Jasons Modifications** and is licensed for use and modification under the [MIT License](LICENSE).

## Support

If you encounter any issues or need help, feel free to reach out for support via [Jasons Modifications Discord](https://discord.gg/JcPAEHq3PJ).

---

Let me know if you need further adjustments!
