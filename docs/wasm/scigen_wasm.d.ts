/* tslint:disable */
/* eslint-disable */

export class ScigenGenerator {
  free(): void;
  [Symbol.dispose](): void;
  load_rules(rules_text: string): void;
  pretty_print(text: string): string;
  constructor(seed: bigint);
  add_rule(name: string, expansion: string): void;
  generate(start_rule: string): string;
}

export function generate_paper(seed: bigint, author1: string, author2: string, sysname: string, rules: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_scigengenerator_free: (a: number, b: number) => void;
  readonly generate_paper: (a: bigint, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number];
  readonly scigengenerator_add_rule: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly scigengenerator_generate: (a: number, b: number, c: number) => [number, number];
  readonly scigengenerator_load_rules: (a: number, b: number, c: number) => void;
  readonly scigengenerator_new: (a: bigint) => number;
  readonly scigengenerator_pretty_print: (a: number, b: number, c: number) => [number, number];
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
