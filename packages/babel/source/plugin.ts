const storeCreators = ['createStore', 'store'];

export default function (babel) {
  const { types: t } = babel;

  const creators = new Set(storeCreators);

  const importVisitor = {
    ImportDeclaration(path) {
      const {
        node: {
          source: { value: source },
          specifiers,
        },
      } = path;

      if (source !== '@cometa/core') return;

      for (let i = 0; i < specifiers.length; i += 1) {
        const s = specifiers[i];
        if (!s.imported) continue;
        if (s.imported.name === s.local.name) continue;

        if (storeCreators.some((sc) => sc === s.imported.name))
          creators.add(s.local.name);
      }
    },
  };

  return {
    name: 'cometa',
    visitor: {
      Program: {
        enter(path, state) {
          path.traverse(importVisitor, state);
        },
      },
      CallExpression(path, state) {
        if (!creators.has(path.node.callee.name)) return;

        console.log(path);

        path.replaceWith(
          t.CallExpression(t.Identifier(`${path.node.callee.name}.m`), [
            path.node.arguments[0],
            t.ObjectExpression([
              t.ObjectProperty(t.Identifier('sid'), t.StringLiteral('12')),
            ]),
          ]),
        );
      },
    },
  };
}
