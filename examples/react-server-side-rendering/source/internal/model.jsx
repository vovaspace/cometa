import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ModelControllerSymbol } from '@cometa/core';
import { useScope } from './scope';

const empty = [];

export const connect = (factory) => {
  const Context = createContext(null);

  const Provider = ({ children, dependencies = empty }) => {
    const initialized = useRef(false);
    const [model, setModel] = useState(() => factory(...dependencies));

    useEffect(() => {
      if (initialized.current) setModel(factory(...dependencies));
      else initialized.current = true;
    }, dependencies);

    return <Context.Provider value={model}>{children}</Context.Provider>;
  };

  Provider.Pure = ({ children, value }) => (
    <Context.Provider value={value}>{children}</Context.Provider>
  );

  const w =
    (Component, { dependencies = () => empty } = {}) =>
    (props) =>
      (
        <Provider dependencies={dependencies()}>
          <Component {...props} />
        </Provider>
      );

  const hook = () => {
    const model = useContext(Context);
    if (model === null) throw new Error('TODO');
    return model;
  };

  return [w, hook, Provider];
};

export const useScoped = (model, key) => {
  const scope = useScope();
  const controller = model[ModelControllerSymbol];
  controller.scope = scope;
  controller.scoped(key);
};
