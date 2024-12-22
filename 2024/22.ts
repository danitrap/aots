import type { Expect, Equal } from "type-testing";

type IntersectionsAreUgly<T> = { [K in keyof T]: T[K] } & {};

type TrimStart<T> = T extends `${" " | "\t" | "\n"}${infer R}`
  ? TrimStart<R>
  : T;

type TrimEnd<T> = T extends `${infer L}${" " | "\t" | "\n"}` ? TrimEnd<L> : T;

type SplitSegment<
  Segment extends string,
  Remaining extends string = Segment,
  DelimiterStack extends string[] = [never],
> = DelimiterStack["length"] extends 0
  ? {
      head: Segment extends `${infer Head}${Remaining}` ? Head : never;
      rest: Remaining extends `,${infer Rest}` ? Rest : Remaining;
    }
  : Remaining extends `${infer Head}${infer Rest}`
    ? DelimiterStack extends [never]
      ? Head extends "[" | "{" | '"'
        ? SplitSegment<Segment, Rest, [Head]>
        : Segment extends `${infer Head},${infer Rest}`
          ? { head: Head; rest: Rest }
          : { head: TrimEnd<Segment>; rest: "" }
      : [DelimiterStack[number], Head] extends
            | ["[", "]"]
            | ["{", "}"]
            | ['"', '"']
        ? SplitSegment<
            Segment,
            Rest,
            DelimiterStack extends [any, ...infer RestD] ? RestD : never
          >
        : Head extends DelimiterStack[number]
          ? SplitSegment<Segment, Rest, [...DelimiterStack, Head]>
          : SplitSegment<Segment, Rest, DelimiterStack>
    : never;

type ParsePrimitive<T> = T extends `"${infer Str extends string}"`
  ? Str
  : T extends `${infer Num extends number}`
    ? Num
    : T extends `${infer Bool extends boolean}`
      ? Bool
      : T extends "null"
        ? null
        : { t: T };

type ParseArray<Line extends string> = Line extends ""
  ? []
  : [
      Parse<SplitSegment<Line>["head"]>,
      ...ParseArray<TrimStart<SplitSegment<Line>["rest"]>>,
    ];

type ParseObject<Line> = Line extends ""
  ? {}
  : Line extends `${infer Key}:${infer Rest}`
    ? IntersectionsAreUgly<
        {
          [K in ParseKey<Key>]: Parse<SplitSegment<TrimStart<Rest>>["head"]>;
        } & ParseObject<TrimStart<SplitSegment<TrimStart<Rest>>["rest"]>>
      >
    : never;

type EscapeSet = { r: "\r"; n: "\n"; b: "\b"; f: "\f" };
type EscapeKey<T, Escaping = false> = T extends `${infer Head}${infer Rest}`
  ? Head extends `\\`
    ? EscapeKey<Rest, true>
    : Escaping extends true
      ? Head extends keyof EscapeSet
        ? `${EscapeSet[Head]}${EscapeKey<Rest>}`
        : never
      : `${Head}${EscapeKey<Rest>}`
  : T;

type ParseKey<T> = T extends `"${infer Key}"`
  ? EscapeKey<Key>
  : T extends `${infer NumKey extends number}`
    ? NumKey
    : never;

type Parse<Source> = Source extends `[${infer ArrMatch}]`
  ? ParseArray<TrimStart<ArrMatch>>
  : Source extends `{${infer ObjMatch}}`
    ? ParseObject<TrimStart<ObjMatch>>
    : ParsePrimitive<Source>;

type t0_actual = Parse<`{
    "a": 1, 
    "b": false, 
    "c": [
      true,
      false,
      "hello",
      {
        "a": "b",
        "b": false
      },
    ],
    "nil": null,
  }`>;

type t0_expected = {
  a: 1;
  b: false;
  c: [
    true,
    false,
    "hello",
    {
      a: "b";
      b: false;
    },
  ];
  nil: null;
};
type t0 = Expect<Equal<t0_actual, t0_expected>>;

type t1_actual = Parse<"1">;
type t1_expected = 1;
type t1 = Expect<Equal<t1_actual, t1_expected>>;

type t2_actual = Parse<"{}">;
type t2_expected = {};
type t2 = Expect<Equal<t2_actual, t2_expected>>;

type t3_actual = Parse<"[]">;
type t3_expected = [];
type t3 = Expect<Equal<t3_actual, t3_expected>>;

type t4_actual = Parse<"[1]">;
type t4_expected = [1];
type t4 = Expect<Equal<t4_actual, t4_expected>>;

type t5_actual = Parse<"true">;
type t5_expected = true;
type t5 = Expect<Equal<t5_actual, t5_expected>>;

type t6_actual = Parse<'["Hello", true, false, null]'>;
type t6_expected = ["Hello", true, false, null];
type t6 = Expect<Equal<t6_actual, t6_expected>>;

type t7_actual = Parse<`{
  "hello\\r\\n\\b\\f": "world",
}`>;
type t7_expected = {
  "hello\r\n\b\f": "world";
};
type t7 = Expect<Equal<t7_actual, t7_expected>>;

type t8_actual = Parse<'{ 1: "world" }'>;
type t8_expected = { 1: "world" };
type t8 = Expect<Equal<t8_actual, t8_expected>>;

type t9_actual = Parse<`{
  "altitude": 123,
  "warnings": [
    "low_fuel",\t\n
    "strong_winds",
  ],
}`>;
type t9_expected = {
  altitude: 123;
  warnings: ["low_fuel", "strong_winds"];
};
type t9 = Expect<Equal<t9_actual, t9_expected>>;
