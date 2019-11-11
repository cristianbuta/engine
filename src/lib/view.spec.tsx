// tslint:disable:no-expression-statement
import React from 'react';
import { view } from './view';
import browserEnv from 'browser-env';
import dbFn from 'jsonmvc-datastore';
import cloneDeep from 'lodash/cloneDeep';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import ui from '../ui-producer';

jest.useFakeTimers();

// @ts-ignore
Enzyme.configure({ adapter: new Adapter() });
browserEnv();

interface Args {
  [key: string]: string;
}

interface Model {
  args: Args;
  path: string;
  fn: (args: { [key: string]: any }) => any;
}

function node(db: any, model: Model) {
  let keys = Object.keys(model.args);
  let args = keys.map(x => model.args[x]);

  const remove = db.node(model.path, args, function() {
    let fnArgs = Array.prototype.slice.call(arguments);

    let argsObj = fnArgs.reduce((acc, x, i) => {
      acc[keys[i]] = x;
      return acc;
    }, {});

    return model.fn(argsObj);
  });
  return remove;
}

beforeEach(() => {});

test('Should mount an empty component', () => {
  const state = {};
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {},
    fn: () => null
  };
  const Component = view(component);
  const el = Enzyme.mount(<Component></Component>);
  expect(el.html()).toBe('');
});

test('Should receive directly passed properties', () => {
  const state = {};
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      prop1: '<prop1>',
      prop2: '<prop2>'
    },
    fn: ({ prop1, prop2 }: any) => (
      <div>
        <div id="prop1">{prop1}</div>
        <div id="prop2">{prop2}</div>
      </div>
    )
  };
  const prop1 = 'prop1 value';
  const prop2 = 'prop2 value';
  const Component = view(component);
  const el = Enzyme.mount(<Component prop1={prop1} prop2={prop2}></Component>);

  expect(el.find('#prop1').text()).toBe(prop1);
  expect(el.find('#prop2').text()).toBe(prop2);
});

test('Should propate change after patch', () => {
  const state = {
    foo: '123'
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      foo: '/foo'
    },
    fn: ({ foo }: any) => <div id="foo">{foo}</div>
  };
  const Component = view(component);
  const el = Enzyme.mount(<Component></Component>);

  expect(el.find('#foo').text()).toBe(state.foo);

  const newValue = '123 123';

  db.patch([
    {
      op: 'add',
      path: '/foo',
      value: newValue
    }
  ]);

  jest.runAllTimers();
  el.update();
  expect(el.find('#foo').text()).toBe(newValue);
});

test('Should propagate property changes', () => {
  const state = {};
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      prop1: '<prop1>'
    },
    fn: ({ prop1, prop2 }: any) => (
      <div>
        <div id="prop1">{prop1}</div>
      </div>
    )
  };
  const prop1 = 'prop1 value';
  const Component = view(component);

  const el = Enzyme.mount(<Component prop1={prop1}></Component>);
  const newPropValue = 'testing this to make sure it works';
  el.setProps({ prop1: newPropValue });
  jest.runAllTimers();
  expect(el.find('#prop1').text()).toBe(newPropValue);
});

test('Should get value from paths created with properties', () => {
  const id = 'id1';
  const value = 'some value';
  const state = {
    foo: {
      [id]: value
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      id: '<prop1>',
      foo: '/foo/<id>'
    },
    fn: ({ foo }: any) => (
      <div>
        <div id="foo">{foo}</div>
      </div>
    )
  };
  const Component = view(component);

  const el = Enzyme.mount(<Component prop1={id}></Component>);
  expect(el.find('#foo').text()).toBe(value);
});

test('Should propagate/react to value from paths created with properties', () => {
  const id = 'id1';
  const value = 'some value';
  const newId = 'newId';
  const newValue = 'another value';
  const state = {
    foo: {
      [id]: value,
      [newId]: newValue
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      id: '<prop1>',
      foo: '/foo/<id>'
    },
    fn: ({ foo }: any) => (
      <div>
        <div id="foo">{foo}</div>
      </div>
    )
  };
  const Component = view(component);

  const el = Enzyme.mount(<Component prop1={id}></Component>);
  el.setProps({ prop1: newId });
  jest.runAllTimers();
  el.update();
  expect(el.find('#foo').text()).toBe(newValue);
});

test('Should react to value changes in computed paths', () => {
  const id = 'id1';
  const value = 'some value';
  const newValue = 'another value';
  const state = {
    foo: {
      [id]: value
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      id: '<prop1>',
      foo: '/foo/<id>'
    },
    fn: ({ foo }: any) => (
      <div>
        <div id="foo">{foo}</div>
      </div>
    )
  };
  const Component = view(component);

  const el = Enzyme.mount(<Component prop1={id}></Component>);
  db.patch([
    {
      op: 'add',
      path: '/foo/id1',
      value: newValue
    }
  ]);
  jest.runAllTimers();
  el.update();
  expect(el.find('#foo').text()).toBe(newValue);
});

test('Should support deeply nested computed paths', () => {
  const prop1 = 'prop1value';
  const prop2 = 'prop2value';
  const prop3 = 'prop3value';
  const finalId = 'finalIdvalue';
  const value = 'some value';
  const state = {
    [prop1]: {
      [prop2]: {
        [prop3]: finalId
      }
    },
    foo: {
      [finalId]: {
        title: value
      }
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const component = {
    args: {
      id1: '<prop1>',
      id2: '<prop2>',
      finalId: '/<id1>/<id2>/<prop3>',
      foo: '/foo/<finalId>/title'
    },
    fn: ({ foo }: any) => (
      <div>
        <div id="foo">{foo}</div>
      </div>
    )
  };
  const Component = view(component);

  const el = Enzyme.mount(
    <Component prop1={prop1} prop2={prop2} prop3={prop3}></Component>
  );
  expect(el.find('#foo').text()).toBe(value);
});

test('Should unsubscribe the listeners when the component gets unmounted', () => {
  let count = 0;
  const fn = ({ baz }: any) => {
    count += 1;
    return baz + 'ok';
  };
  const state = {
    baz: 'initial'
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const remove = node(db, {
    path: '/bar',
    args: {
      baz: '/baz'
    },
    fn
  });

  const component = {
    args: {
      foo: '/bar'
    },
    fn: ({ foo }: any) => {
      return <div>{foo}</div>;
    }
  };
  const Component = view(component);
  const el = Enzyme.mount(<Component></Component>);
  el.unmount();
  jest.runAllTimers();
  db.patch([
    {
      op: 'add',
      path: '/baz',
      value: 'second'
    }
  ]);

  expect(count).toBe(1);
  remove();
});

test('Should handle an error', () => {
  const state = {
    foo: 'initial'
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;
  const errorMessage = 'Sample error';
  const component = {
    args: {
      foo: '/foo'
    },
    fn: ({ foo }: any) => {
      foo;
      throw new Error(errorMessage);
    }
  };
  const Component = view(component);
  console.error = jest.fn();
  const el = Enzyme.mount(<Component></Component>);
  expect(el.find('.errorMessage').text()).toBe(errorMessage);
  (console.error as any).mockRestore();
});

test('Should handle default props', () => {
  const value1 = 'value one';
  const id1 = 'id1';
  const state = {
    foo: {
      [id1]: value1
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const testId = 'testId';

  const component = {
    args: {
      foo: '/foo/<prop1>'
    },
    defaultProps: {
      prop1: id1
    },
    fn: ({ foo }: any) => {
      return (
        <div>
          <span id={testId}>{foo}</span>
        </div>
      );
    }
  };

  const Component = view(component);

  const el = Enzyme.mount(<Component></Component>);
  expect(el.find(`#${testId}`).text()).toBe(value1);
});

test('Should provide default props to paths', () => {
  const value1 = 'value one';
  const id1 = 'id1';
  const state = {
    foo: {
      [id1]: value1
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const testId = 'testId';

  const component = {
    args: {
      foo: '/foo/<prop1>'
    },
    defaultProps: {
      prop1: id1
    },
    fn: ({ foo }: any) => {
      return (
        <div>
          <span id={testId}>{foo}</span>
        </div>
      );
    }
  };

  const Component = view(component);

  const el = Enzyme.mount(<Component></Component>);
  expect(el.find(`#${testId}`).text()).toBe(value1);
});

test('Should overwrite default props with new props', () => {
  const value1 = 'value one';
  const value2 = 'value two';
  const id1 = 'id1';
  const id2 = 'id2';
  const state = {
    foo: {
      [id1]: value1,
      [id2]: value2
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const testId = 'testId';

  const component = {
    args: {
      foo: '/foo/<prop1>'
    },
    defaultProps: {
      prop1: id1
    },
    fn: ({ foo }: any) => {
      return (
        <div>
          <span id={testId}>{foo}</span>
        </div>
      );
    }
  };

  const Component = view(component);

  const el = Enzyme.mount(<Component></Component>);
  el.setProps({ prop1: id2 });
  el.update();
  jest.runAllTimers();
  expect(el.find(`#${testId}`).text()).toBe(value2);
});

test('Should not throw error if the default properties have falsy values', () => {
  const state = {
    foo: {
      id: 'initial'
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const testId = 'testId';

  const component = {
    args: {
      foo: '/foo/<prop1>',
      bar: '/bar/<prop2>',
      baz: '/baz/<prop3>'
    },
    defaultProps: {
      prop1: undefined,
      prop2: '',
      prop3: null
    },
    fn: ({ foo, bar, baz }: any) => {
      return (
        <div>
          <span id={testId}>
            {foo}
            {bar}
            {baz}
          </span>
        </div>
      );
    }
  };

  const Component = view(component);

  const el = Enzyme.mount(<Component></Component>);
  jest.runAllTimers();
  expect(el.find(`#${testId}`).text()).toBeFalsy();
});

test('Should not throw error if the provided properties have falsy values', () => {
  const state = {
    foo: {
      id: 'initial'
    }
  };
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const testId = 'testId';

  const component = {
    args: {
      foo: '/foo/<prop1>',
      bar: '/bar/<prop2>',
      baz: '/baz/<prop3>'
    },
    fn: ({ foo, bar, baz }: any) => {
      return (
        <div>
          <span id={testId}>
            {foo}
            {bar}
            {baz}
          </span>
        </div>
      );
    }
  };

  const Component = view(component);
  const el = Enzyme.mount(
    <Component prop1={undefined} prop2={''} prop3={null}></Component>
  );
  jest.runAllTimers();
  expect(el.find(`#${testId}`).text()).toBeFalsy();
});

test('Should propagate an ui-patch from the component to the component', () => {
  const state = {};
  const db = dbFn(cloneDeep(state));
  (window as any).db = db;

  const testId = 'testId';
  const buttonId = 'buttonId';
  const newValue = 'another value';

  const component = {
    args: {
      foo: '/foo'
    },
    fn: ({ foo }: any) => {
      return (
        <div>
          <span id={testId}>{foo}</span>
          <div id={buttonId} data-patch={`add /foo "${newValue}"`}></div>
        </div>
      );
    }
  };

  const Component = view(component);
  const el = Enzyme.mount(<Component></Component>);
  const buttonEl = el.find(`#${buttonId}`).getDOMNode();
  const rootEl = el.getDOMNode();
  const unsubscribe = ui(rootEl, db, ['click']);
  const ev = new Event('click', { bubbles: true });
  (buttonEl as any).dispatchEvent(ev);
  jest.runAllTimers();
  el.update();
  expect(el.find(`#${testId}`).text()).toBe(newValue);
  unsubscribe && unsubscribe();
});
