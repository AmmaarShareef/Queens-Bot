# Queens Bot 👑

A Chrome extension that instantly solves LinkedIn’s Queens puzzle using a backtracking algorithm.

The algorithm solves the board in under a second — a small delay is added when placing queens so LinkedIn’s game can register the clicks.

-----

## How It Works

### 1. Reading the Board

When the extension popup opens, it sends a message to a content script running inside the LinkedIn page. The content script reads the board by querying all cell elements via their `data-testid` attributes and parsing each cell’s `aria-label` — which conveniently contains the cell’s color/region, row, and column in plain English.

Example: `"Empty cell of color Vibrant Coral, row 6, column 5"`

The grid size is extracted from the game container’s inline CSS variable.

### 2. Solving with Backtracking

The solver uses a backtracking algorithm optimized by tackling the most constrained regions first (fewest available cells).

For each color region (sorted by size ascending):

- Collect all valid candidate cells — not blocked by row, column, or diagonal
- Try placing a queen in the first candidate
- Block that row, column, and all 8 diagonal neighbours
- Recurse into the next region
- If the recursive call fails — undo the placement, unblock everything, try the next candidate
- If no candidates work — return false (triggers backtrack in the caller)
- If all regions are placed successfully — return true and propagate success up the chain

### 3. Placing the Queens

Once solved, hitting the **Solve** button sends the solution positions to the content script. It finds each target cell in the DOM and simulates real mouse events (`mousedown`, `mouseup`, `click`) twice per cell with a small async delay between each placement — mimicking a real user clicking.

-----

## File Structure

```
queens-solver/
├── manifest.json       — Extension config (permissions, content script, popup)
├── content.js          — Board reading, solving algorithm, click simulation
├── popup.html          — Extension UI
├── popup.js            — Triggers board read on open, sends solve message on button click
└── popup.css           — Styling
```

-----

## Installation

1. Clone or download this repository
1. Open Chrome and go to `chrome://extensions`
1. Enable **Developer mode** (toggle in the top right)
1. Click **Load unpacked** and select the `queens-solver` folder
1. The Queens Bot icon will appear in your toolbar

-----

## Usage

1. Open LinkedIn and navigate to the Queens game
1. Click the **Queens Bot** extension icon
1. The popup will display the detected grid size (e.g. `9 x 9 Grid detected`)
1. Click **Solve!** — queens are placed automatically

-----

## Algorithm Notes

- Regions are sorted by cell count ascending before solving — this is the “most constrained first” heuristic and significantly reduces backtracking in practice
- Blocking covers the placed cell’s entire row, entire column, and all 8 immediate diagonal neighbours
- The board state is tracked purely in memory using JavaScript `Set` objects — no DOM manipulation during solving
- Average solve time is under 10ms for standard grid sizes

-----

## Tech

- Vanilla JavaScript
- Chrome Extensions Manifest V3
- No external libraries or dependencies
