// Type definitions for baretest 2.0
// Project: https://volument.com/baretest
// Definitions by: Rory O’Kane <https://github.com/roryokane>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "baretest" {
  export = baretest;

  export type Baretest = typeof baretest;

  declare function baretest(headline: string): Tester;

  export type Tester = TesterFunction & TesterSubFunctions;

  export type TesterFunction = (
    name: string,
    fn: SyncOrAsyncVoidFunction
  ) => void;

  export interface TesterSubFunctions {
    only: (name: string, fn: SyncOrAsyncVoidFunction) => void;
    skip: (name?: string, fn?: SyncOrAsyncVoidFunction) => void;
    before: (fn: SyncOrAsyncVoidFunction) => void;
    after: (fn: SyncOrAsyncVoidFunction) => void;
    run: () => Promise<boolean>;
  }

  export type SyncOrAsyncVoidFunction = () => void | Promise<void>;
}
