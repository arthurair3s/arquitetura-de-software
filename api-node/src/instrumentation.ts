import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

// obtém o endpoint do exporter através de variáveis de ambiente
const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';
const serviceName = process.env.OTEL_SERVICE_NAME || 'api-node';

console.log(`[OTel] Inicializando telemetria para ${serviceName} enviando para ${url}...`);

const sdk = new NodeSDK({
  serviceName,
  traceExporter: new OTLPTraceExporter({
    url,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

try {
  sdk.start();
  console.log('[OTel] Telemetria iniciada com sucesso.');
} catch (err) {
  console.error('[OTel] Falha ao inicializar OpenTelemetry SDK:', err);
}

// desliga o sdk de forma limpa quando o processo é encerrado
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('[OTel] SDK desligado com sucesso.'))
    .catch((err) => console.error('[OTel] Erro ao desligar SDK:', err))
    .finally(() => process.exit(0));
});
