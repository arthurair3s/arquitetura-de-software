import { diContainer } from '../../../shared/infrastructure/container.js';
import { createRecomendacaoQuery } from './recomendacaoQuery.js';
import { createRecomendacaoMutation } from './recomendacaoMutation.js';

export const recomendacaoResolver = {
  Query: createRecomendacaoQuery(),
  Mutation: createRecomendacaoMutation()
};
