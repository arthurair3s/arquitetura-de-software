import grpc from '@grpc/grpc-js';
import { comDeadline, opcoesDeCanal, DEADLINE_ROTEAMENTO_MS } from './resilience.js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getProtoPath = (filename: string): string => {
  const pathDocker = path.resolve(__dirname, '..', '..', 'protos', filename);
  if (fs.existsSync(pathDocker)) return pathDocker;
  return path.resolve(__dirname, '..', '..', '..', 'protos', filename);
};

const PROTO_PATH = getProtoPath('roteamento.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const roteamentoProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface IRoteamentoServiceClient extends grpc.Client {
  CalcularResumoRota(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  ObterGeometriaRota(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  CalcularRotaMultiplosPontos(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  EncaixarNaEstrada(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
}

const client = new roteamentoProto.RoteamentoService(
  process.env.ROTEAMENTO_SERVICE_URL || 'localhost:5002',
  grpc.credentials.createInsecure(),
  opcoesDeCanal()
) as IRoteamentoServiceClient;

export default comDeadline(client, DEADLINE_ROTEAMENTO_MS);
