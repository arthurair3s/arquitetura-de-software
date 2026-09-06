import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLError, type GraphQLSchema } from 'graphql';

const NOME_DIRETIVA = 'auth';

/**
 * Middleware de autorização central do schema.
 *
 * Em vez de repetir `if (!context.user) throw` dentro de cada resolver — onde é
 * fácil esquecer — cada campo declara a sua exigência no próprio SDL:
 *
 *   meusPedidos: [Pedido] @auth
 *   entregasPendentes: [Entrega] @auth(roles: ["ENTREGADOR"])
 *
 * O que não tem a diretiva é público por decisão explícita (catálogo, login,
 * registro), e isso fica legível direto no schema.
 */
export function aplicarAuthDirective(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const diretiva = getDirective(schema, fieldConfig, NOME_DIRETIVA)?.[0];
      if (!diretiva) return fieldConfig;

      const rolesPermitidas: string[] = diretiva.roles ?? [];
      const { resolve = defaultFieldResolver } = fieldConfig;

      fieldConfig.resolve = function (source, args, context, info) {
        const usuario = context?.user;

        if (!usuario) {
          throw new GraphQLError(
            'Autenticação obrigatória. Envie um token válido no header Authorization.',
            { extensions: { code: 'UNAUTHENTICATED' } }
          );
        }

        if (rolesPermitidas.length > 0 && !rolesPermitidas.includes(usuario.role)) {
          throw new GraphQLError(
            `Acesso negado: '${info.fieldName}' exige um dos perfis [${rolesPermitidas.join(', ')}].`,
            { extensions: { code: 'FORBIDDEN' } }
          );
        }

        return resolve(source, args, context, info);
      };

      return fieldConfig;
    },
  });
}
