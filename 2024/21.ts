import type { Expect, Equal } from "type-testing";

type SyntaxNode =
  | { type: "VariableDeclaration"; id: string }
  | { type: "CallExpression"; argument: string };

type VariableDeclarationsTokens = "let" | "var" | "const";

type TrimStart<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Head extends " " | "\n" | "\t" | "\r"
    ? TrimStart<Tail>
    : S
  : S;

type ParseSyntaxNode<Statement extends string> =
  Statement extends `${VariableDeclarationsTokens} ${infer Id} = ${string}`
    ? { type: "VariableDeclaration"; id: Id }
    : Statement extends `${string}(${infer Argument})`
      ? { type: "CallExpression"; argument: Argument }
      : never;

type Parse<
  Source,
  Accumulator extends SyntaxNode[] = [],
> = Source extends `${infer Statement};${infer Rest}`
  ? Parse<Rest, [...Accumulator, ParseSyntaxNode<TrimStart<Statement>>]>
  : Accumulator;

type ScopeReport = { declared: string[]; used: string[] };

type AnalyzeScope<
  Source,
  SyntaxNodes extends SyntaxNode[] = Parse<Source>,
  Accumulator extends ScopeReport = {
    declared: [];
    used: [];
  },
> = SyntaxNodes extends [
  infer Head extends SyntaxNode,
  ...infer Tail extends SyntaxNode[],
]
  ? AnalyzeScope<
      Source,
      Tail,
      Head extends Extract<SyntaxNode, { type: "VariableDeclaration" }>
        ? {
            declared: [...Accumulator["declared"], Head["id"]];
            used: Accumulator["used"];
          }
        : Head extends Extract<SyntaxNode, { type: "CallExpression" }>
          ? {
              declared: Accumulator["declared"];
              used: [...Accumulator["used"], Head["argument"]];
            }
          : never
    >
  : Accumulator;

type TupleDiff<T extends any[], U extends any[]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends U[number]
    ? TupleDiff<Tail, U>
    : [Head, ...TupleDiff<Tail, U>]
  : [];

type Lint<Source, Report extends ScopeReport = AnalyzeScope<Source>> = {
  scope: Report;
  unused: TupleDiff<Report["declared"], Report["used"]>;
};

type t0_actual = Lint<`
let teddyBear = "standard_model";
`>;
type t0_expected = {
  scope: { declared: ["teddyBear"]; used: [] };
  unused: ["teddyBear"];
};
type t0 = Expect<Equal<t0_actual, t0_expected>>;

type t1_actual = Lint<`
buildToy(teddyBear);
`>;
type t1_expected = {
  scope: { declared: []; used: ["teddyBear"] };
  unused: [];
};
type t1 = Expect<Equal<t1_actual, t1_expected>>;

type t2_actual = Lint<`
let robotDog = "deluxe_model";
assembleToy(robotDog);
`>;
type t2_expected = {
  scope: { declared: ["robotDog"]; used: ["robotDog"] };
  unused: [];
};
type t2 = Expect<Equal<t2_actual, t2_expected>>;

type t3_actual = Lint<`
let robotDog = "standard_model";
  const giftBox = "premium_wrap";
    var ribbon123 = "silk";
  
  \t
  wrapGift(giftBox);
  \r\n
      addRibbon(ribbon123);
`>;
type t3_expected = {
  scope: {
    declared: ["robotDog", "giftBox", "ribbon123"];
    used: ["giftBox", "ribbon123"];
  };
  unused: ["robotDog"];
};
type t3 = Expect<Equal<t3_actual, t3_expected>>;

type t4_actual = Lint<"\n\t\r \t\r ">;
type t4_expected = {
  scope: { declared: []; used: [] };
  unused: [];
};
type t4 = Expect<Equal<t4_actual, t4_expected>>;
