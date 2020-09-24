import db from "@c11/engine.db";
import { Producer } from "@c11/engine.producer";
import { Render, view } from "./react";
import {
  EngineInstance,
  EngineConfig,
  ProducerInstance,
  EngineStatus,
  EngineContext,
  ProducerContext,
  RenderInstance,
  ViewInstance,
} from "@c11/engine.types";

export { view };

export class Engine implements EngineInstance {
  private engineStatus: EngineStatus = EngineStatus.NOT_INITIALIZED;
  private config: EngineConfig;
  private producers: ProducerInstance[];
  private render: RenderInstance | null = null;
  private producerContext: ProducerContext;
  private views: ViewInstance[];
  constructor(config: EngineConfig) {
    this.config = config;
    this.views = [];
    this.producers = [];
    let initialState = {};
    if (config.state) {
      initialState = config.state;
    }
    this.producerContext = {
      db: db(initialState),
      addView: this.addView.bind(this),
      debug: config.debug,
    };
    if (config.autostart || config.autostart === undefined) {
      this.start();
    }
  }

  private init() {
    if (this.config.producers) {
      this.producers = this.config.producers.list.map((config) => {
        const producer = new Producer(config, this.producerContext);
        producer.mount();
        return producer;
      });
    }

    if (this.config.view) {
      this.render = new Render(this.producerContext, this.config.render);
      this.render.mount();
    }

    this.engineStatus = EngineStatus.RUNNING;
  }

  private addView(view: ViewInstance) {
    this.views.push(view);
  }

  private getProducers() {
    const viewsProducers = this.views.reduce((acc, x) => {
      acc = acc.concat(x.producers);
      return acc;
    }, [] as ProducerInstance[]);
    return [...this.producers, ...viewsProducers];
  }
  // private resume() {}

  /**
   * Mounts the application and the producers.
   * ```
   * const engine = new Engine(config).start()
   * ```
   */
  start() {
    if (this.engineStatus === EngineStatus.NOT_INITIALIZED) {
      this.init();
    } else if (this.engineStatus === EngineStatus.STOPPED) {
      // this.resume();
    } else {
      // nothing, engine already running
    }
    return this;
  }

  get status() {
    return this.engineStatus;
  }

  get context() {
    const context: EngineContext = {
      db: this.context.db,
      producers: this.getProducers(),
    };

    if (this.render) {
      context.container = this.render.getContainer(),
    }

    return context;
  }

  stop() {
    // TODO: Implement the stop method
    return this;
  }

  // update() {
  // for views ReactDOM.unmountComponentAtNode(container)
  // }
}
