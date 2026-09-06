import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { comDeadline, opcoesDeCanal } from './resilience.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getProtoPath = (filename: string): string => {
  const pathDocker = path.resolve(__dirname, '..', '..', 'protos', filename);
  if (fs.existsSync(pathDocker)) return pathDocker;
  return path.resolve(__dirname, '..', '..', '..', 'protos', filename);
};

const PROTO_PATH = getProtoPath('recomendacao.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const recomendacaoProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface IInsightItem {
  produto_id: number;
  produto_nome: string;
  preco_atual: number;
  tipo_sugestao: string;
  sugestao: string;
}

export interface IInsightsResponse {
  status: string;
  plano: string;
  restaurante: string;
  concorrentes_analisados: number;
  insights: IInsightItem[];
}

export interface IAssinaturaResponse {
  restaurante_id: number;
  plano: string;
  message: string;
}

export interface IRecomendacaoServiceClient extends grpc.Client {
  ObterInsightsLoja(request: { restaurante_id: number }, callback: (error: grpc.ServiceError | null, response: IInsightsResponse) => void): void;
  AtualizarAssinatura(request: { restaurante_id: number, plano: string }, callback: (error: grpc.ServiceError | null, response: IAssinaturaResponse) => void): void;
}

const ENDERECO = process.env.RECOMENDACAO_SERVICE_URL || 'localhost:50053';

const client = recomendacaoProto.recomendacao && recomendacaoProto.recomendacao.RecomendacaoService
  ? new recomendacaoProto.recomendacao.RecomendacaoService(
      ENDERECO,
      grpc.credentials.createInsecure(),
      opcoesDeCanal()
    ) as IRecomendacaoServiceClient
  : new (recomendacaoProto.RecomendacaoService || recomendacaoProto.recomendacao)(
      ENDERECO,
      grpc.credentials.createInsecure(),
      opcoesDeCanal()
    ) as IRecomendacaoServiceClient;

export default comDeadline(client);
