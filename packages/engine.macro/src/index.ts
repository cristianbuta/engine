import { ProducerConfig } from "@c11/engine.types";
import { createMacro, MacroHandler } from "babel-plugin-macros";
import { ReactElement } from "react";
import { addPathImport } from "./utils/addPathImport";
import { addWildcardImport } from "./utils/addWildcardImport";
import { prepareForEngine, TransformType } from "./utils/prepareForEngine";

/**
 * TODO: Verify which args are used by the function and eliminate
 * unnecessary ones
 */

const EngineMacroHandler: MacroHandler = ({
  references,
  state,
  babel,
  // @ts-ignore
  config,
}) => {
  const { Wildcard = [], Path = [], View = [], Producer = [] } = references;
  state.config = config;
  View.forEach((x) => prepareForEngine(babel, state, x, TransformType.VIEW));
  Producer.forEach((x) =>
    prepareForEngine(babel, state, x, TransformType.PRODUCER)
  );
  if (Path.length > 0) {
    Path.forEach((x) => {
      addPathImport(babel, state, x);
    });
  }
  if (Wildcard.length > 0) {
    Wildcard.forEach((x) => {
      addWildcardImport(babel, state, x);
    });
  }
};

interface Config {
  [k: string]: any;
}

export type Producer<T = any> = (props: T) => void;
declare type ViewFunction<T> = (props: T) => ReactElement<T> | null;
export declare type View<T = any> = ViewFunction<T> & {
  producers?: Producer[];
};
export const Observe: any = {};
export const Update: any = {};
export const Get: any = {};
export const Arg: any = {};
export const Prop: any = {};
export const Param: any = {};
export const Path: any = {};
export const Wildcard: any = {};

const macro = createMacro(EngineMacroHandler, {
  configName: "engine",
});
export default macro;
