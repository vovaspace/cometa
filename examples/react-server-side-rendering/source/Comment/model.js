import { createEffect, createModel, createStore } from '@cometa/core';
import { forward } from '@cometa/operators';
import { connect } from '../internal/model';

export const createCommentModel = (api) =>
  createModel(() => {
    const comment = createStore(null);

    const loadCommentFx = createEffect(api.getComment);

    forward(loadCommentFx.done, comment);

    return {
      comment,
      loadCommentFx,
    };
  });

export const [withCommentModel, useCommentModel] = connect(createCommentModel);
