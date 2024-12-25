import { Expect, Equal } from "type-testing";

type ThankYouSoMuch = true;

type t0 = Expect<Equal<ThankYouSoMuch, true>>;
