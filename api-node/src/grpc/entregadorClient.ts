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

const PROTO_PATH = getProtoPath('entregadores.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const entregadorProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface IEntregadorServiceClient extends grpc.Client {
  CadastrarEntregador(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  BuscarProximos(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  ObterEntregadorPorId(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  ListarTodosEntregadores(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  EditarEntregador(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  DeletarEntregador(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  AtualizarStatus(request: any, callback: (error: grpc.ServiceError | null, response: any) => void): void;
  AtualizarLocalizacaoStream(callback: (error: grpc.ServiceError | null, response: any) => void): grpc.ClientWritableStream<any>;
}

const client = new entregadorProto.EntregadorService(
  process.env.ENTREGADORES_SERVICE_URL || 'localhost:5001',
  grpc.credentials.createInsecure(),
  opcoesDeCanal()
) as IEntregadorServiceClient;

export default comDeadline(client);
