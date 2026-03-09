let cells = [];
let onlyColors = [];

let blockedRows = new Set();
let blockedCols = new Set();
let blockedCells = new Set();

let placedQueens = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'readBoard') {

    // RESET
    cells = [];
    onlyColors = [];

    blockedRows = new Set();
    blockedCols = new Set();
    blockedCells = new Set();

    placedQueens = [];

    // Grid dimensions
    let styleString = document.querySelector('[data-testid="interactive-grid"]').getAttribute("style");
    const starts = styleString.indexOf(":");
    const ends = styleString.indexOf(";", starts)
    let gridSize = styleString.slice(starts+1, ends).trim()

    //Full layout
    let cell;
    let cellCount = 0
    let colorsCount = {}
    let descriptions = document.querySelectorAll('[data-testid^="cell-"]');

    for (let i=1; i<=parseInt(gridSize); i++){
      for (let j=1; j<=parseInt(gridSize); j++){
          desc = descriptions[cellCount].getAttribute("aria-label");
          cell = {id: `cell-${cellCount}`, color: "", row: 0, col: 0};
          // splice from where "of color" ends to the first comma, and trim it
          cell.color = desc.slice(desc.indexOf("of color") + "of color".length, desc.indexOf(",")).trim();
          if (cell.color in colorsCount) {
            colorsCount[cell.color] += 1;
          } else {
            colorsCount[cell.color] = 1;
          }
          cell.row = i;
          cell.col = j;
          cells.push(cell);
          cellCount++;
      }
    }

    // Sorting colors
    let colorsArray = Object.entries(colorsCount).sort((a, b) => a[1] - b[1])

    for (let i of colorsArray){
          onlyColors.push(i[0])
    }

    console.log("colors: " + onlyColors)

    queens(0)
    console.log(placedQueens)

    sendResponse({size: gridSize, layout: cells});
    console.log(cells)

  } else if (msg.action === 'solve') {

    solve();

  }

  return true;
});

function queens(colorIdx) {

  // Reaches the last color successfully
  if (colorIdx == onlyColors.length) {
    return true;
  }

  let curCells = [];

  for (let cl of cells) {
    if (!(blockedRows.has(cl.row)) && !(blockedCols.has(cl.col)) && !(blockedCells.has(`${cl.row},${cl.col}`)) && cl.color == onlyColors[colorIdx]) {
      curCells.push(cl);
    }
  }
  
  for (let c of curCells) {
    // Include
    placedQueens.push(c.id);
    blockedRows.add(c.row);
    blockedCols.add(c.col);
    //Right and left
    blockedCells.add(`${c.row},${c.col-1}`);
    blockedCells.add(`${c.row},${c.col+1}`);
    //Top and bottom
    blockedCells.add(`${c.row-1},${c.col}`);
    blockedCells.add(`${c.row+1},${c.col}`);
    // 4 corners
    blockedCells.add(`${c.row+1},${c.col+1}`)
    blockedCells.add(`${c.row+1},${c.col-1}`)
    blockedCells.add(`${c.row-1},${c.col+1}`)
    blockedCells.add(`${c.row-1},${c.col-1}`)

    // Move forward
    // If last color is reached successfully, it will return a chain of true's meaning backtracking is ignored completely
    if (queens(colorIdx + 1)) return true;

    // Backtrack
    placedQueens.pop();
    blockedRows.delete(c.row);
    blockedCols.delete(c.col);
    //Right and left
    blockedCells.delete(`${c.row},${c.col-1}`);
    blockedCells.delete(`${c.row},${c.col+1}`);
    //Top and bottom
    blockedCells.delete(`${c.row-1},${c.col}`);
    blockedCells.delete(`${c.row+1},${c.col}`);
    // 4 corners
    blockedCells.delete(`${c.row+1},${c.col+1}`)
    blockedCells.delete(`${c.row+1},${c.col-1}`)
    blockedCells.delete(`${c.row-1},${c.col+1}`)
    blockedCells.delete(`${c.row-1},${c.col-1}`)
  }

  // Failed recursive call, no cell found at some point thus the above loop doesn't run
  return false;

}

function clickCell(cell) {
  cell.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  cell.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  cell.dispatchEvent(new MouseEvent('click', {bubbles: true}));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function solve() {
  for (let q of placedQueens) {
    const cellToClick = document.querySelector(`[data-testid="${q}"]`);
    if (cellToClick.getAttribute("aria-label").slice(0, 5) == "Cross"){
      clickCell(cellToClick);
      await sleep(10);
      continue;
    } else if (cellToClick.getAttribute("aria-label").slice(0, 5) == "Queen"){
      continue;
    }
    clickCell(cellToClick);
    await sleep(10);
    clickCell(cellToClick);
    await sleep(10);
  }
}