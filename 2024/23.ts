import type { Expect, Equal } from "type-testing";

interface Operation {
  args: unknown;
  arg0: this["args"] extends [infer arg, ...unknown[]] ? arg : never;
  return: unknown;
}

type Apply<F extends Operation, U> = (F & {
  args: [U];
})["return"];

interface Cap extends Operation {
  return: Capitalize<this["arg0"]>;
}

interface Extends extends Operation {
  return: LazyExtends<this["arg0"]>;
}

interface LazyExtends<T> extends Operation {
  return: this["arg0"] extends T ? true : false;
}

interface Push extends Operation {
  return: LazyPush<this["arg0"]>;
}

interface LazyPush<T> extends Operation {
  return: [...this["arg0"], T];
}

interface Filter extends Operation {
  return: LazyFilter<this["arg0"]>;
}

interface LazyFilter<F extends Operation> extends Operation {
  return: FilterImpl<F, this["arg0"]>;
}

type FilterImpl<F extends Operation, T extends unknown[]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? true extends Apply<F, Head>
    ? [Head, ...FilterImpl<F, Tail>]
    : FilterImpl<F, Tail>
  : [];

interface ApplyAll extends Operation {
  return: LazyApplyAll<this["arg0"]>;
}

interface LazyApplyAll<F extends Operation> extends Operation {
  return: ApplyAllImpl<F, this["arg0"]>;
}

type ApplyAllImpl<F extends Operation, T extends unknown[]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [Apply<F, Head>, ...ApplyAllImpl<F, Tail>]
  : [];

type t0_actual = Apply<Cap, "hello">; // =>
type t0_expected = "Hello"; // =>
type t0 = Expect<Equal<t0_actual, t0_expected>>;

type a = Apply<Push, "world">;
//   ^?
type ap = Apply<a, ["hello"]>;
//   ^?

type t1_actual = Apply<Apply<Push, "world">, ["hello"]>;
//      ^?
type t1_expected = ["hello", "world"]; // =>
type t1 = Expect<Equal<t1_actual, t1_expected>>;

type t2_actual = Apply<
  // =>
  Apply<ApplyAll, Cap>,
  Apply<Apply<Push, "world">, ["hello"]>
>;
type t2_expected = ["Hello", "World"]; // =>
type t2 = Expect<Equal<t2_actual, t2_expected>>;

type t3_actual = Apply<
  // =>
  Apply<Filter, Apply<Extends, number>>,
  [1, "foo", 2, 3, "bar", true]
>;
type t3_expected = [1, 2, 3]; // =>
type t3 = Expect<Equal<t3_actual, t3_expected>>;

type Station1 = Apply<Cap, "robot">; // =>
type Station2 = Apply<Apply<Push, Station1>, ["Tablet", "teddy bear"]>; // =>
type Station3 = Apply<
  Apply<Filter, Apply<Extends, Apply<Cap, string>>>,
  Station2
>;
type t4_actual = Station3;
type t4_expected = ["Tablet", "Robot"];
type t4 = Expect<Equal<t4_actual, t4_expected>>;
