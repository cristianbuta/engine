declare module 'react-html-attributes' {
  interface Elements {
    [key: string]: any;
  }
  interface Attr {
    '*': string[];
    elements: Elements;
  }
  const attr: Attr;
  export default attr;
}

declare module 'jsonmvc-datastore' {
  interface Patch {
    op: string;
    path: string;
    value?: any;
  }
  export interface DB {
    node(
      path: string,
      args: { [key: string]: string },
      fn: (args: any) => any
    ): any;
    has(path: string): boolean;
    get(path: string): any;
    on(path: string, cb: (value: any) => void): () => void;
    patch(patches: Patch[]): void;
  }
  export function dbFn(obj: object): DB;
  export default dbFn;
}

declare module 'kebab-case' {
  function fn(str: string): string;
  export default fn;
}