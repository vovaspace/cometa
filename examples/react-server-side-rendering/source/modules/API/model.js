import { createEffect } from '@cometa/core';
import { connect } from '../../internal/model';

export const createAPIModel = (salt) => ({
  getContentWithCommentIds: createEffect(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          const s = salt.salt.value();

          resolve({
            content: `Content with salt: ${s}`,
            comments: [`id-${s}-1`, `id-${s}-2`, `id-${s}-3`],
          });
        }, 1000);
      }),
  ),

  getComment: createEffect(
    ({ id }) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            text: `Comment with id ${id}`,
          });
        }, 500);
      }),
  ),
});

export const [withAPIModel, useAPIModel] = connect(createAPIModel);
