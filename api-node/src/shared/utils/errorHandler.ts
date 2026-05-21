import { GraphQLError } from 'graphql';
import { DomainError } from '../errors/DomainError.js';
import { logger } from './logger.js';

/**
 * Executa uma função assíncrona e converte erros de domínio em GraphQLError.
 * Preserva erros que já são GraphQLError e converte erros inesperados.
 */
export async function withDomainErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error instanceof GraphQLError) {
      throw error;
    }
    
    if (error instanceof DomainError) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: error.code || 'BAD_USER_INPUT',
          details: error.details
        }
      });
    }

    logger.error(`Erro interno não tratado no Resolver: ${error?.message}`, 'GraphQL');
    throw new GraphQLError('Ocorreu um erro interno no servidor.', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    });
  }
}
