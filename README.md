# MinePal

MinePal is an Electron application that runs a Mineflayer based Minecraft bot. The bot uses GPT models to chat and perform actions in game. This fork focuses on continuous local play with simple autonomous behaviours.

## Prerequisites

- Node.js 18+ (tested with Node 18 and 20)
- A running Minecraft server that matches the version in `settings.json`

## Installation

```bash
npm install
```

## Running the Bot

1. Adjust `settings.json` for your server host, port and Minecraft version.
2. Edit `ethan.json` or create a new profile to tweak the bot's personality and enabled modes.
3. Start the application:

```bash
npm start
```

The bot will log in using the profile name and begin interacting with the world.

## Project Structure

- `src/agent` – main bot logic, modes and command handling
- `src/process` – process helpers for launching and updating bots
- `mineflayer-*` – bundled forks of mineflayer plugins
- `frontend/` – simple UI used by the Electron wrapper

## Notes

The bot stores memory and mode state under `userDataDir/bots/<name>`. To start fresh simply delete that folder.
