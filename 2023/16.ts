import { Expect, Equal } from "type-testing";

type WithIndex<Tuple extends any[], Output extends any[] = []> = Tuple extends [
  infer First,
  ...infer Rest,
]
  ? WithIndex<Rest, [...Output, [First, Output["length"]]]>
  : Output;

type WithIndexDeep<Tuple extends any[][]> = Tuple extends [
  infer First extends any[],
  ...infer Rest extends any[],
]
  ? [WithIndex<First>, ...WithIndexDeep<Rest>]
  : [];

type DoFind<Forest extends any[]> = Forest extends [infer First, ...infer Rest]
  ? First extends ["🎅🏼", infer Count]
    ? Count
    : DoFind<Rest>
  : never;

type DoFind2D<ForestWithIndices extends any[]> = ForestWithIndices extends [
  infer First,
  ...infer Rest,
]
  ? First extends [infer Row extends any[], infer RowCoord]
    ? DoFind<Row> extends never
      ? DoFind2D<Rest>
      : [...[RowCoord, DoFind<Row>], ...DoFind2D<Rest>]
    : []
  : [];

type FindSanta<Forest extends any[]> = DoFind2D<
  WithIndex<WithIndexDeep<Forest>>
>;

type Forest0 = [
  ["🎅🏼", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_0_actual = FindSanta<Forest0>;
//   ^?
type test_0_expected = [0, 0];
type test_0 = Expect<Equal<test_0_expected, test_0_actual>>;

type Forest1 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎅🏼", "🎄", "🎄"],
];
type test_1_actual = FindSanta<Forest1>;
//   ^?
type test_1_expected = [3, 1];
type test_1 = Expect<Equal<test_1_expected, test_1_actual>>;

type Forest2 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎅🏼", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_2_actual = FindSanta<Forest2>;
//   ^?
type test_2_expected = [2, 2];
type test_2 = Expect<Equal<test_2_expected, test_2_actual>>;

type Forest3 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎅🏼", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_3_actual = FindSanta<Forest3>;
//   ^?
type test_3_expected = [2, 1];
type test_3 = Expect<Equal<test_3_expected, test_3_actual>>;

type Forest4 = [
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎅🏼", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
  ["🎄", "🎄", "🎄", "🎄"],
];
type test_4_actual = FindSanta<Forest4>;
//   ^?
type test_4_expected = [1, 2];
type test_4 = Expect<Equal<test_4_expected, test_4_actual>>;
