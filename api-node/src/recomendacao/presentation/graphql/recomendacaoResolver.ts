import { diContainer } from '../../../shared/infrastructure/container.js';
import { createRecomendacaoQuery } from './recomendacaoQuery.js';
import { createRecomendacaoMutation } from './recomendacaoMutation.js';

const service = diContainer.getRecomendacaoService();

export const recomendacaoResolver = {
  Query: createRecomendacaoQuery(service),
  Mutation: createRecomendacaoMutation(service)
};
