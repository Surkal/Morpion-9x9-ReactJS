/******* Bugs connus *******/
/*
 * match nul sous-grille et board
 * Reset du timer
 * Arrêter la partie lorsque le timer d'un joueur est nul.
 */

function Reset(props) {
  return /*#__PURE__*/(
    React.createElement("button", { onClick: props.onClick },
    props.gameOver ? 'Rejouer' : 'Reset'));


}

function Square(props) {
  return /*#__PURE__*/(
    React.createElement("td", {
      className: props.className,
      onClick: props.onClick,
      key: props.id.toString() },

    props.value));


}

function LargeSquare(props) {
  return /*#__PURE__*/(
    React.createElement("td", {
      className: props.className,
      rowSpan: 3,
      colSpan: 3,
      key: props.id.toString() },

    props.value));


}


class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(81).fill(null),
      mainGrid: Array(9).fill(null),
      xIsNext: true,
      isActive: false,
      winCells: null,
      gameOver: false,
      subgridFirstCells: [0, 3, 6, 27, 30, 33, 54, 57, 60],
      subgrids: [
      [0, 1, 2, 9, 10, 11, 18, 19, 20],
      [3, 4, 5, 12, 13, 14, 21, 22, 23],
      [6, 7, 8, 15, 16, 17, 24, 25, 26],
      [27, 28, 29, 36, 37, 38, 45, 46, 47],
      [30, 31, 32, 39, 40, 41, 48, 49, 50],
      [33, 34, 35, 42, 43, 44, 51, 52, 53],
      [54, 55, 56, 63, 64, 65, 72, 73, 74],
      [57, 58, 59, 66, 67, 68, 75, 76, 77],
      [60, 61, 62, 69, 70, 71, 78, 79, 80]],

      playableSubgrid: null,
      lastCell: null };

  }

  getClassNames(cell, isLarge) {
    let className = ['square'];
    const subgridId = getSubgridNumber(cell);

    // border class
    if (cell % 9 === 2 || cell % 9 === 5) {
      className.push('border-right');
    }
    if (Math.floor(cell / 9) === 2 || Math.floor(cell / 9) === 5) {
      className.push('border-bottom');
    }

    if (isLarge) {
      className.push('large-square');
    }

    // Special color for last move
    //   little square
    if (this.state.lastCell === cell) {
      className.push('last-cell');
    }
    //   large square
    if (isLarge && getSubgridNumber(this.state.lastCell) === subgridId) {
      className.push('last-cell');
    }

    if (this.state.winCells) {
      if (this.state.winCells.indexOf(subgridId) !== -1) {
        className.push('win-cell');
        return className.join(' ');
      }
    }
    if (!this.state.winCells && this.state.lastCell !== cell) {
      if (this.state.playableSubgrid === null) {
        if (!this.state.mainGrid[subgridId]) {
          className.push('playable');
        }
        return className.join(' ');
      }
      if (this.state.subgrids[this.state.playableSubgrid].indexOf(cell) !== -1) {
        className.push('playable');
      }
    }

    return className.join(' ');
  }

  nextPlayer() {
    return this.state.xIsNext ? 'X' : 'O';
  }

  handleClick(i) {
    let winCells = null;
    const squares = this.state.squares.slice();
    const mainGrid = this.state.mainGrid.slice();
    const lastPlayedSubgrid = getSubgridNumber(i);

    const playableSubgrid = getNextSubgrid(this.state.lastCell, mainGrid);
    let nextSubgrid = getNextSubgrid(i, mainGrid);

    if (this.state.mainGrid[lastPlayedSubgrid]) {
      return null;
    }
    if (playableSubgrid !== null && playableSubgrid !== lastPlayedSubgrid) {
      return null;
    }
    if (this.state.winCells || squares[i]) {
      return null;
    }
    squares[i] = this.nextPlayer();
    // Subgrid won?
    if (isSubgridWon(squares, this.state.subgrids[lastPlayedSubgrid])) {
      mainGrid[lastPlayedSubgrid] = this.nextPlayer();

      // Game over?
      const winner = calculateWinner(mainGrid);
      if (winner) {
        winCells = winner[1];
        // TODO: isActive = false
      } else if (nextSubgrid === lastPlayedSubgrid) {
        // if the last move played returns to the same sub-grid, we can play anywhere
        nextSubgrid = null;
      }
    }

    this.setState({
      squares: squares,
      mainGrid: mainGrid,
      xIsNext: !this.state.xIsNext,
      playableSubgrid: nextSubgrid,
      lastCell: i,
      winCells: winCells,
      gameOver: !!winCells,
      isActive: squares.indexOf('O') !== -1 && !winCells });

  }

  renderSquare(i) {
    const subgridId = getSubgridNumber(i);
    if (!this.state.mainGrid[subgridId]) {
      return /*#__PURE__*/(
        React.createElement(Square, {
          value: this.state.squares[i],
          className: this.getClassNames(i, false),
          id: i,
          onClick: () => this.handleClick(i) }));


    }
    if (this.state.subgridFirstCells.indexOf(i) === -1) {
      return null;
    }
    const player = this.state.mainGrid[subgridId];
    return /*#__PURE__*/(
      React.createElement(LargeSquare, {
        value: player,
        className: this.getClassNames(i, true),
        id: i }));


  }

  reset() {
    return /*#__PURE__*/(
      React.createElement(Reset, {
        onClick: () => this.resetBoard(),
        gameOver: this.state.gameOver }));


  }

  resetBoard() {
    const squares = Array(9).fill(null);
    const mainGrid = Array(9).fill(null);
    const playableSubgrid = null;
    const lastCell = null;
    this.setState({
      squares: squares,
      mainGrid: mainGrid,
      playableSubgrid: playableSubgrid,
      lastCell: lastCell,
      winCells: null,
      gameOver: false,
      isActive: false });

  }

  renderTable() {
    let rows = [];
    for (let i = 0; i < 9; i++) {
      rows.push(this.renderRows(i));
    }
    return /*#__PURE__*/React.createElement("tbody", null, rows);
  }

  renderRows(index) {
    let rows = [];
    for (let i = 0; i < 9; i++) {
      const id = index * 9 + i;
      rows.push(this.renderSquare(id));
    }
    return /*#__PURE__*/React.createElement("tr", { key: (index + 100).toString() }, rows);
  }

  renderBoard() {
    return /*#__PURE__*/(
      React.createElement("table", { className: "board" },
      this.renderTable()));


  }

  render() {

    let status;
    if (this.state.gameOver) {
      const player = this.state.xIsNext ? 'O' : 'X';
      status = `Joueur ${player} a gagné !`;
    } else if (this.state.squares.indexOf(null) === -1) {
      status = 'Match nul !';
    } else {
      status = `Prochain joueur : ${this.nextPlayer()}`;
    }

    return /*#__PURE__*/(
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { className: "status" },
      status), /*#__PURE__*/


      React.createElement("div", { className: "board" },
      this.renderBoard()), /*#__PURE__*/

      React.createElement("div", null, /*#__PURE__*/
      React.createElement(Timer, { isActive: this.state.isActive, currentPlayer: this.state.xIsNext ? 'X' : 'O' })), /*#__PURE__*/

      React.createElement("div", { className: "reset" },
      this.reset())));



  }}



class Game extends React.Component {
  render() {
    return /*#__PURE__*/React.createElement(Board, null);
  }}


function Timer(props) {
  const [seconds, setSeconds] = React.useState({ X: 60, O: 60 });
  const interval = 1000;

  const handleUpdate = () => {
    seconds[props.currentPlayer]--;
    setSeconds({ ...seconds });
  };

  React.useEffect(() => {
    let interval = null;
    if (props.isActive) {
      interval = setInterval(() => {
        handleUpdate();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [props.isActive, seconds, props.currentPlayer]);

  return /*#__PURE__*/(
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("p", null, "Joueur X : ", seconds['X'], " seconds"), /*#__PURE__*/
    React.createElement("p", null, "Joueur O : ", seconds['O'], " seconds")));


}


ReactDOM.render( /*#__PURE__*/
React.createElement(Game, null),
document.getElementById('root'));


/***************/
/** Functions **/
/***************/

/** Determine if there is a winner.
  * Returns the victorious player and
  * an array containing the numbers of the 3 winning cells.
  * Or null if there is no winner. 
 */
function calculateWinner(squares) {
  const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a, b, c]];
    }
  }
  return null;
}

/**
  * Gives the number of the subgrid (from 0 to 8) containing
  * the cell with coordinates [row, column]
  */
function getSubgridNumber(cell) {
  let coordinates = getCoordinates(cell);
  let lineNumber = coordinates['lineNumber'];
  let columnNumber = coordinates['columnNumber'];
  return Math.floor(lineNumber / 3) * 3 + Math.floor(columnNumber / 3);
}

/* Converts the cell number into coordinates [row, column] */
function getCoordinates(cell_number) {
  const lineNumber = Math.floor(cell_number / 9);
  const columnNumber = cell_number % 9;
  return { lineNumber: lineNumber, columnNumber: columnNumber };
}

/* Determines the next sub-grid to be played from the last move played */
function getNextSubgrid(cell, mainGrid) {
  if (cell === null) return null;
  let coordinates = getCoordinates(cell);
  let lineNumber = coordinates['lineNumber'];
  let columnNumber = coordinates['columnNumber'];
  lineNumber %= 3;
  columnNumber %= 3;
  const nextSubgrid = lineNumber * 3 + columnNumber;
  return playableSubgrid(nextSubgrid, mainGrid);
}

function playableSubgrid(subgridId, mainGrid) {
  return mainGrid[subgridId] ? null : subgridId;
}

function isSubgridWon(grid, indexes) {
  let subgrid = [];
  for (let i of indexes) {
    subgrid.push(grid[i]);
  }
  return calculateWinner(subgrid);
}