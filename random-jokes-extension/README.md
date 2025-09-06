# Random Jokes Browser Extension

A modern, responsive browser extension that delivers random jokes to brighten your day.

## Features

- **Modern UI**: Clean, elegant design with smooth animations
- **Responsive**: Works well on different popup sizes
- **Error Handling**: Graceful handling of API failures
- **Copy Functionality**: Copy jokes to share with friends
- **Multiple Categories**: Jokes from various categories (Programming, Pun, Spooky, etc.)
- **Safe Mode**: Filters out explicit content

## Installation

1. Download or clone this repository
2. Open your browser's extension management page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click on the extension icon in your browser's toolbar
2. Enjoy a random joke!
3. Click "New Joke" for another one
4. Use the copy button to share jokes with friends

## API

This extension uses the [JokeAPI](https://sv443.net/jokeapi/v2/) to fetch jokes. It's a free, well-maintained API with a wide variety of joke categories.

## Development

The extension is built with:

- Vanilla JavaScript (ES6+)
- Modern CSS with variables
- Font Awesome icons
- Fetch API with async/await

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Privacy

This extension only requests jokes from the API and does not collect any user data.
