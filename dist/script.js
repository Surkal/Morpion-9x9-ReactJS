function Square(props) {
  return /*#__PURE__*/(
    React.createElement("td", {
      className: props.className,
      onClick: props.onClick,
      rowSpan: props.size,
      colSpan: props.size,
      key: props.id.toString() },

    props.value));


}


class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(81).fill(null),
      main_grid: Array(9).fill(null),
      xIsNext: true,
      win_cells: null, // null or array or winning cell
      // unused in the class for the moment
      subgrid_first_cells: [0, 3, 6, 27, 30, 33, 54, 57, 60],
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

      playable_subgrid: null,
      last_cell: null };

  }

  getClassNames(cell) {
    let class_name = ['square'];
    const subgrid_id = getSubgridNumber(cell);
    if (cell % 9 === 2 || cell % 9 === 5) {
      class_name.push('border-right');
    }
    if (Math.floor(cell / 9) === 2 || Math.floor(cell / 9) === 5) {
      class_name.push('border-bottom');
    }
    //
    /*
    if (this.state.win_cells && this.state.win_cells.indexOf(cell) !== -1) {
      class_name.push('win-cell');
    }*/
    if (this.state.main_grid[getSubgridNumber(cell)]) {
      class_name.push('subgrid');
    }
    if (this.state.win_cells) {
      if (this.state.win_cells.indexOf(subgrid_id) !== -1) {
        class_name.push('win-cell');
        return class_name.join(' ');
      }
    }
    if (!this.state.win_cells) {
      if (this.state.playable_subgrid === null) {
        if (!this.state.main_grid[getSubgridNumber(cell)]) {
          class_name.push('playable');
        }
        return class_name.join(' ');
      }
      if (this.state.subgrids[this.state.playable_subgrid].indexOf(cell) !== -1) {
        class_name.push('playable');
      }
    }

    return class_name.join(' ');
  }

  nextPlayer() {
    return this.state.xIsNext ? 'X' : 'O';
  }

  handleClick(i) {
    let win_cells = null;
    const squares = this.state.squares.slice();
    const main_grid = this.state.main_grid.slice();
    const last_played_subgrid = getSubgridNumber(i);

    const playable_subgrid = nextSubgrid(this.state.last_cell, main_grid);
    const next_subgrid = nextSubgrid(i, main_grid);

    if (this.state.main_grid[last_played_subgrid]) {
      return null;
    }
    if (playable_subgrid !== null && playable_subgrid !== last_played_subgrid) {
      return null;
    }
    if (this.state.win_cells || squares[i]) {
      return null;
    }

    squares[i] = this.nextPlayer();
    // Subgrid won?
    if (isSubgridWon(squares, this.state.subgrids[last_played_subgrid])) {
      main_grid[last_played_subgrid] = this.nextPlayer();

      // Game over?
      const winner = calculateWinner(main_grid);
      if (winner) {
        win_cells = winner[1];
      }
    }

    console.log(main_grid);
    console.log(win_cells);

    this.setState({
      squares: squares,
      main_grid: main_grid,
      xIsNext: !this.state.xIsNext,
      playable_subgrid: next_subgrid,
      last_cell: i,
      win_cells: win_cells });

  }

  renderSquare(i) {
    const subgrid_id = getSubgridNumber(i);
    let size = 1;
    if (!this.state.main_grid[subgrid_id]) {
      return /*#__PURE__*/(
        React.createElement(Square, {
          value: this.state.squares[i],
          className: this.getClassNames(i),
          id: i,
          size: size,
          onClick: () => this.handleClick(i) }));


    }
    if (this.state.subgrid_first_cells.indexOf(i) === -1) {
      return null;
    }
    const player = this.state.main_grid[subgrid_id];
    size = 3;
    return /*#__PURE__*/(
      React.createElement(Square, {
        value: player,
        className: this.getClassNames(i),
        id: i,
        size: size,
        onClick: () => this.handleClick(i) }));


  }

  resetBoard() {
    const squares = Array(9).fill(null);
    const main_grid = Array(9).fill(null);
    const playable_subgrid = null;
    const last_cell = null;
    this.setState({
      squares: squares,
      main_grid: main_grid,
      playable_subgrid: playable_subgrid,
      last_cell: last_cell,
      win_cells: null });

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
    if (this.state.win_cells) {
      const player = this.state.xIsNext ? 'O' : 'X';
      status = `Joueur ${player} a gagné !`;
    } else if (this.state.squares.indexOf(null) === -1) {
      status = 'Match nul !';
    } else {
      status = `Prochain joueur : ${this.nextPlayer()}`;
    }

    return /*#__PURE__*/(
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { className: "status" }, status), /*#__PURE__*/
      React.createElement("div", { className: "board" },
      this.renderBoard()), /*#__PURE__*/

      React.createElement("div", { className: "reset" }, /*#__PURE__*/
      React.createElement("button", { onClick: () => this.resetBoard() }, "Reset"))));





  }}



class Game extends React.Component {
  render() {
    return /*#__PURE__*/React.createElement(Board, null);
  }}



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
  let line_number, column_number;
  [line_number, column_number] = getCoordinates(cell);
  return Math.floor(line_number / 3) * 3 + Math.floor(column_number / 3);
}

/* Converts the cell number into coordinates [row, column] */
function getCoordinates(cell_number) {
  const line_number = Math.floor(cell_number / 9);
  const column_number = cell_number % 9;
  return [line_number, column_number];
}

/* Determines the next sub-grid to be played from the last move played */
function nextSubgrid(cell, main_grid) {
  if (!cell) return null;
  let line_number, column_number;
  [line_number, column_number] = getCoordinates(cell);
  line_number %= 3;
  column_number %= 3;
  const nextSubgrid = line_number * 3 + column_number;
  return playableSubgrid(nextSubgrid, main_grid);
}

function playableSubgrid(subgrid_id, main_grid) {
  return main_grid[subgrid_id] ? null : subgrid_id;
}

function isSubgridWon(grid, indexes) {
  let subgrid = [];
  for (let i of indexes) {
    subgrid.push(grid[i]);
  }
  return calculateWinner(subgrid);
}