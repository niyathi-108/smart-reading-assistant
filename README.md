# Smart Reading Assistant

A lightweight Chrome extension that adds accessibility features and text-processing tools directly into the browser's side panel.

## Features

- **Read Aloud** with Pause, Resume, and Stop controls
- 
- **Text actions**: define, summarize, expand, simplify, synonyms, analogy, step-by-step breakdown
- 
- **Accessibility options**:
  - Large font
    
  - High contrast
    
  - Dyslexia-friendly font
    
  - Extra spacing

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/chrome-sidepanel-extension.git
2. Open Chrome and go to: 
-Code
-chrome://extensions/
-Enable Developer mode (toggle in the top right).
-Click Load unpacked and select the project folder.
-The extension will now appear in your browser's extensions list.

## Project Structure

-manifest.json        -Extension manifest

-sidepanel.html       -Side panel UI

-sidepanel.js         -Side panel logic

-background.js        -Background script 

-icons/               -Extension icons

## Configuration
Replace `YOUR_API_KEY` in `background.js` with your own Groq API key.

## Usage

-Select text on any webpage.

-Open the extension side panel.

-Choose an action (define, summarize, expand, simplify, synonyms, analogy, steps).

-Use the Read Aloud button to listen to the output.

-Adjust accessibility toggles to customize the text display.

## Development Notes

Built with vanilla JavaScript, HTML, and CSS.
Uses Chrome's storage.local API for saving preferences.
Uses the Web Speech API (speechSynthesis) for text-to-speech.
No external dependencies required.

