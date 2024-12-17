import type { Equal, Expect } from "type-testing";

const compose =
  <A, B, C, D>(f: (x: A) => B, g: (x: B) => C, h: (x: C) => D) =>
  (a: A): D =>
    h(g(f(a)));

type FirstChar<In extends string> =
  In extends `${infer FirstChar extends string}${string}` ? FirstChar : never;

const upperCase = <In extends string>(x: In) =>
  x.toUpperCase() as Uppercase<In>;
const lowerCase = <In extends string>(x: In) =>
  x.toLowerCase() as Lowercase<In>;
const firstChar = <In extends string>(x: In): FirstChar<In> =>
  x[0] as FirstChar<In>;
const firstItem = <In extends any[]>(
  x: In,
): In extends [infer Single]
  ? Single
  : In extends [infer Head, infer _]
    ? Head
    : never => x[0];
const makeTuple = <In>(x: In): [In] => [x];
const makeBox = <In>(value: In): { value: In } => ({ value });

const t0 = compose(upperCase, makeTuple, makeBox)("hello!").value[0];
//    ^?
type t0_actual = typeof t0; // =>
type t0_expected = "HELLO!"; // =>
type t0_test = Expect<Equal<t0_actual, t0_expected>>;

const t1 = compose(makeTuple, firstItem, makeBox)("hello!" as const).value;
//    ^?
type t1_actual = typeof t1; // =>
type t1_expected = "hello!"; // =>
type t1_test = Expect<Equal<t1_actual, t1_expected>>;

const t2 = compose(upperCase, firstChar, lowerCase)("hello!");
//    ^?
type t2_actual = typeof t2; // =>
type t2_expected = "h"; // =>
type t2_test = Expect<Equal<t2_actual, t2_expected>>;
