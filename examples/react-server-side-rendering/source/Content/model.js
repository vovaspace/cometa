import { createModel, effect, store } from '@cometa/core';
import { forward } from '@cometa/operators';
import { connect } from '../internal/model';

export const createContentModel = (api) =>
  createModel((controller) => {
    controller.scoped('Content');

    const $content = store(null);
    const $commentIds = store([]);

    const initFx = effect(api.getContentWithCommentIds);

    forward(initFx.done, $content, (payload) => payload.content);
    forward(initFx.done, $commentIds, (payload) => payload.comments);

    return { $content, $commentIds, initFx };
  });

export const [withContentModel, useContentModel] = connect(createContentModel);
