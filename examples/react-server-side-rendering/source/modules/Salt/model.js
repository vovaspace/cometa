import { createStore } from '@cometa/core';
import { connect } from '../../internal/model';

export const createSaltModel = () => ({
  salt: createStore(''),
});

export const [withSaltModel, useSaltModel, SaltModelProvider] =
  connect(createSaltModel);
