import { Equal, Expect } from "type-testing";

type TicTacToeChip = "❌" | "⭕";
type TicTacToeEndState = "❌ Won" | "⭕ Won" | "Draw";
type TicTacToeState = TicTacToeChip | TicTacToeEndState;
type TicTacToeEmptyCell = "  ";
type TicTacToeCell = TicTacToeChip | TicTacToeEmptyCell;
type TicTacToeYPositions = "top" | "middle" | "bottom";
type TicTacToeXPositions = "left" | "center" | "right";
type TicTacToePositions = `${TicTacToeYPositions}-${TicTacToeXPositions}`;
type TicTacToeBoard = TicTacToeCell[][];
type TicTacToeGame = {
  board: TicTacToeBoard;
  state: TicTacToeState;
};

type EmptyBoard = [["  ", "  ", "  "], ["  ", "  ", "  "], ["  ", "  ", "  "]];

type NewGame = {
  board: EmptyBoard;
  state: "❌";
};

type PositionToYIndex<Position extends TicTacToeYPositions> = {
  top: 0;
  middle: 1;
  bottom: 2;
}[Position];
type PositionToXIndex<Position extends TicTacToeXPositions> = {
  left: 0;
  center: 1;
  right: 2;
}[Position];

type GetXY<Move extends TicTacToePositions> = Move extends `${infer Y extends
  TicTacToeYPositions}-${infer X extends TicTacToeXPositions}`
  ? [PositionToXIndex<X>, PositionToYIndex<Y>]
  : never;

type Index = [2, 1, 0];

type ResolveIndex<RestLength extends number> = RestLength extends Index[number]
  ? Index[RestLength]
  : never;

type PlaceRow<
  Row extends TicTacToeCell[],
  X extends Index[number],
  Chip extends TicTacToeChip,
> = Row extends [infer Cell, ...infer RestCells extends TicTacToeCell[]]
  ? ResolveIndex<RestCells["length"]> extends X
    ? [
        Cell extends TicTacToeEmptyCell ? Chip : Cell,
        ...PlaceRow<RestCells, X, Chip>,
      ]
    : [Cell, ...PlaceRow<RestCells, X, Chip>]
  : [];

type PlaceInBoard<
  Board extends TicTacToeBoard,
  XY extends [X: Index[number], Y: Index[number]],
  Chip extends TicTacToeChip,
> = Board extends [
  infer Row extends TicTacToeCell[],
  ...infer RestRows extends TicTacToeBoard,
]
  ? XY[1] extends ResolveIndex<RestRows["length"]>
    ? [PlaceRow<Row, XY[0], Chip>, ...PlaceInBoard<RestRows, XY, Chip>]
    : [Row, ...PlaceInBoard<RestRows, XY, Chip>]
  : [];

type a = PlaceInBoard<EmptyBoard, GetXY<"bottom-left">, "⭕">;
//   ^?

type DidChipWin<
  Chip extends TicTacToeChip,
  Board extends TicTacToeBoard,
> = Board extends [[Chip, any, any], [Chip, any, any], [Chip, any, any]]
  ? true
  : Board extends [[any, Chip, any], [any, Chip, any], [any, Chip, any]]
    ? true
    : Board extends [[any, any, Chip], [any, any, Chip], [any, any, Chip]]
      ? true
      : Board extends [[Chip, Chip, Chip], [any, any, any], [any, any, any]]
        ? true
        : Board extends [[any, any, any], [Chip, Chip, Chip], [any, any, any]]
          ? true
          : Board extends [[any, any, any], [any, any, any], [Chip, Chip, Chip]]
            ? true
            : Board extends [
                  [Chip, any, any],
                  [any, Chip, any],
                  [any, any, Chip],
                ]
              ? true
              : Board extends [
                    [any, any, Chip],
                    [any, Chip, any],
                    [Chip, any, any],
                  ]
                ? true
                : false;

type b = DidChipWin<
  "⭕",
  [["  ", "❌", "❌"], ["⭕", "⭕", "❌"], ["❌", "❌", "❌"]]
>;
//   ^?

type AreThereEmpties<Row extends TicTacToeCell[], Test = false> = Row extends [
  infer Cell,
  ...infer RestCells extends TicTacToeCell[],
]
  ? AreThereEmpties<
      RestCells,
      Test extends false
        ? Cell extends TicTacToeEmptyCell
          ? true
          : false
        : false
    >
  : Test;

type RecAreThereEmpties<Board extends TicTacToeBoard> = Board extends [
  infer Row extends TicTacToeCell[],
  ...infer RestRows extends TicTacToeBoard,
]
  ? [AreThereEmpties<Row>, ...RecAreThereEmpties<RestRows>]
  : [];

type IsEveryCellFilled<Board extends TicTacToeBoard> =
  RecAreThereEmpties<Board> extends [false, false, false] ? true : false;

type blu = IsEveryCellFilled<
  [["❌", "❌", "❌"], ["❌", "❌", "❌"], ["❌", "❌", "❌"]]
>;
//   ^?

type DidAnyoneWin<Board extends TicTacToeBoard> = DidChipWin<
  "⭕",
  Board
> extends true
  ? "⭕ Won"
  : DidChipWin<"❌", Board> extends true
    ? "❌ Won"
    : IsEveryCellFilled<Board> extends true
      ? "Draw"
      : "no";

type IsInvalid<
  Board extends TicTacToeBoard,
  XY extends [Index[number], Index[number]],
> = Board[XY[1]][XY[0]] extends TicTacToeEmptyCell ? false : true;

type TicTacToe<
  Game extends TicTacToeGame,
  Move extends TicTacToePositions,
  XY extends [Index[number], Index[number]] = GetXY<Move>,
> = Game["state"] extends TicTacToeChip
  ? {
      board: PlaceInBoard<Game["board"], XY, Game["state"]>;
      state: DidAnyoneWin<
        PlaceInBoard<Game["board"], XY, Game["state"]>
      > extends "no"
        ? IsInvalid<Game["board"], XY> extends true
          ? Game["state"]
          : Exclude<TicTacToeChip, Game["state"]>
        : DidAnyoneWin<PlaceInBoard<Game["board"], XY, Game["state"]>>;
    }
  : Game;

type test_move1_actual = TicTacToe<NewGame, "top-center">;
//   ^?
type test_move1_expected = {
  board: [["  ", "❌", "  "], ["  ", "  ", "  "], ["  ", "  ", "  "]];
  state: "⭕";
};
type test_move1 = Expect<Equal<test_move1_actual, test_move1_expected>>;

type test_move2_actual = TicTacToe<test_move1_actual, "top-left">;
//   ^?
type test_move2_expected = {
  board: [["⭕", "❌", "  "], ["  ", "  ", "  "], ["  ", "  ", "  "]];
  state: "❌";
};
type test_move2 = Expect<Equal<test_move2_actual, test_move2_expected>>;

type test_move3_actual = TicTacToe<test_move2_actual, "middle-center">;
//   ^?
type test_move3_expected = {
  board: [["⭕", "❌", "  "], ["  ", "❌", "  "], ["  ", "  ", "  "]];
  state: "⭕";
};
type test_move3 = Expect<Equal<test_move3_actual, test_move3_expected>>;

type test_move4_actual = TicTacToe<test_move3_actual, "bottom-left">;
//   ^?
type test_move4_expected = {
  board: [["⭕", "❌", "  "], ["  ", "❌", "  "], ["⭕", "  ", "  "]];
  state: "❌";
};
type test_move4 = Expect<Equal<test_move4_actual, test_move4_expected>>;

type test_x_win_actual = TicTacToe<test_move4_actual, "bottom-center">;
//   ^?
type test_x_win_expected = {
  board: [["⭕", "❌", "  "], ["  ", "❌", "  "], ["⭕", "❌", "  "]];
  state: "❌ Won";
};
type test_x_wina = DidAnyoneWin<test_x_win_actual["board"]>;
//   ^?
type test_x_win = Expect<Equal<test_x_win_actual, test_x_win_expected>>;

type type_move5_actual = TicTacToe<test_move4_actual, "bottom-right">;
//   ^?
type type_move5_expected = {
  board: [["⭕", "❌", "  "], ["  ", "❌", "  "], ["⭕", "  ", "❌"]];
  state: "⭕";
};
type test_move5 = Expect<Equal<type_move5_actual, type_move5_expected>>;

type test_o_win_actual = TicTacToe<type_move5_actual, "middle-left">;
//   ^?
type test_o_win_expected = {
  board: [["⭕", "❌", "  "], ["⭕", "❌", "  "], ["⭕", "  ", "❌"]];
  state: "⭕ Won";
};

// invalid move don't change the board and state
type test_invalid_actual = TicTacToe<test_move1_actual, "top-center">;
//   ^?
type test_invalid_expected = {
  board: [["  ", "❌", "  "], ["  ", "  ", "  "], ["  ", "  ", "  "]];
  state: "⭕";
};
type test_invalid = Expect<Equal<test_invalid_actual, test_invalid_expected>>;

type test_before_draw = {
  board: [["⭕", "❌", "⭕"], ["⭕", "❌", "❌"], ["❌", "⭕", "  "]];
  state: "⭕";
};
type test_draw_actual = TicTacToe<test_before_draw, "bottom-right">;
//   ^?
type test_draw_expected = {
  board: [["⭕", "❌", "⭕"], ["⭕", "❌", "❌"], ["❌", "⭕", "⭕"]];
  state: "Draw";
};
type test_draw = Expect<Equal<test_draw_actual, test_draw_expected>>;
