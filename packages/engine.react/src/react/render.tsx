import React from "react";
import ReactDOM from "react-dom";
import { ViewProvider } from "./context";
import {
  ProducerContext,
  RenderInstance,
  RenderConfig,
  Container,
} from "@c11/engine.types";

export class Render implements RenderInstance {
  private context: ProducerContext;
  private config: RenderConfig;
  private container: Container = null;
  constructor(context: ProducerContext, config: RenderConfig) {
    this.config = config;
    this.context = context;
  }
  private render(container: HTMLElement) {
    this.container = container;
    ReactDOM.render(
      <ViewProvider value={this.context}>{this.config.element}</ViewProvider>,
      container
    );
  }
  getContainer() {
    return this.container;
  }
  unmount() {
    return this;
  }
  mount() {
    let container;
    if (typeof this.config.container === "string") {
      container = document.querySelector(this.config.container);
    } else if (this.config.container instanceof Function) {
      container = this.config.container();
    } else {
      container = this.config.container;
    }

    if (container instanceof Promise) {
      container.then((x) => {
        this.render(x);
      });
    } else {
      this.render(container);
    }
    return this;
  }
}
