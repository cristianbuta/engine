import { ProducerConfig, ProducerContext, ProducerInstance } from "./producer";
import { ViewInstance } from "./view";
import { DatastoreInstance } from "./db";
import { RenderConfig, Container } from "./view";

export type EngineConfig = {
  autostart?: boolean;
  producers?: {
    list: ProducerConfig[];
  };
  render?: RenderConfig;
  state?: {
    [key: string]: any;
  };
  debug?: boolean;
};

export interface EngineContext {
  db: DatastoreInstance;
  producers: ProducerInstance[];
  container?: Container;
}

export enum EngineStatus {
  NOT_INITIALIZED,
  RUNNING,
  STOPPED,
}

export interface EngineInstance {
  status: EngineStatus;
  context: EngineContext;
  start: () => void;
  stop: () => void;
}

export abstract class Engine {}
