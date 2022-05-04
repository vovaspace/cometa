import { createContext, lazy, useContext, Suspense, SuspenseList } from 'react';
import { useScope } from '../internal/scope';
import { useSuspension } from '../internal/suspension';
import { useValue } from '../internal/value';
import { useAPIModel } from '../modules/API';
import { useContentModel, withContentModel } from './model';

const LazyComment = lazy(() =>
  import('../Comment').then(({ Comment }) => ({
    default: Comment,
  })),
);

export const Content = withContentModel(
  () => {
    const model = useContentModel();

    useSuspension(model.initFx);

    const content = useValue(model.$content);
    const commentIds = useValue(model.$commentIds);

    return (
      <div>
        {content === null ? <div>No content!</div> : <div>{content}</div>}

        {commentIds.map((id) => (
          <Suspense key={id} fallback={<div>Loading...</div>}>
            <LazyComment id={id} />
          </Suspense>
        ))}
      </div>
    );
  },
  { dependencies: () => [useAPIModel()] },
);
