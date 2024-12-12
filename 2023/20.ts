type Letters = {
  A: ["█▀█ ", "█▀█ ", "▀ ▀ "];
  B: ["█▀▄ ", "█▀▄ ", "▀▀  "];
  C: ["█▀▀ ", "█ ░░", "▀▀▀ "];
  E: ["█▀▀ ", "█▀▀ ", "▀▀▀ "];
  H: ["█ █ ", "█▀█ ", "▀ ▀ "];
  I: ["█ ", "█ ", "▀ "];
  M: ["█▄░▄█ ", "█ ▀ █ ", "▀ ░░▀ "];
  N: ["█▄░█ ", "█ ▀█ ", "▀ ░▀ "];
  P: ["█▀█ ", "█▀▀ ", "▀ ░░"];
  R: ["█▀█ ", "██▀ ", "▀ ▀ "];
  S: ["█▀▀ ", "▀▀█ ", "▀▀▀ "];
  T: ["▀█▀ ", "░█ ░", "░▀ ░"];
  Y: ["█ █ ", "▀█▀ ", "░▀ ░"];
  W: ["█ ░░█ ", "█▄▀▄█ ", "▀ ░ ▀ "];
  " ": ["░", "░", "░"];
  ":": ["#", "░", "#"];
  "*": ["░", "#", "░"];
};

type S3 = [string, string, string];

type Concat3<A extends S3, B extends S3> = [
  `${A[0]}${B[0]}`,
  `${A[1]}${B[1]}`,
  `${A[2]}${B[2]}`,
];

type RecConcat3<
  Tuples extends S3[],
  Acc extends S3 = ["", "", ""],
> = Tuples extends [infer FirstT extends S3, ...infer RestT extends S3[]]
  ? RecConcat3<RestT, Concat3<Acc, FirstT>>
  : Acc;

type GetLetterTuple<L extends keyof Letters> = Letters[L];

type MapToTuple<S extends string> = S extends `${infer First}${infer Rest}`
  ? Uppercase<First> extends keyof Letters
    ? [GetLetterTuple<Uppercase<First>>, ...MapToTuple<Rest>]
    : never
  : [];

type ToAsciiArt<S extends string> =
  S extends `${infer FirstLine}\n${infer Rest}`
    ? [...RecConcat3<MapToTuple<FirstLine>>, ...ToAsciiArt<Rest>]
    : [...RecConcat3<MapToTuple<S>>];
