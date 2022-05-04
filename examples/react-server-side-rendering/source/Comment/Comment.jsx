import { useAPIModel } from '../modules/API/model';
import { useSuspension } from '../internal/suspension';
import { useCommentModel, withCommentModel } from './model';
import { useScoped } from '../internal/model';
import { useValue } from '../internal/value';

export const Comment = withCommentModel(
  ({ id }) => {
    const model = useCommentModel();

    useScoped(model, `Comment/${id}`);
    useSuspension(model.loadCommentFx, { id }, [id]);

    const comment = useValue(model.comment);

    return <span>{comment?.text}</span>;
  },
  { dependencies: () => [useAPIModel()] },
);
