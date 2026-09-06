using Features.ProcessamentoRotas;
using Features.ProcessamentoRotas.Contracts;

using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// obtém o nome do serviço e endpoint do exporter de telemetria
var otelServiceName = Environment.GetEnvironmentVariable("OTEL_SERVICE_NAME") ?? "ms-roteamento";
var otelEndpoint = Environment.GetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT") ?? "http://localhost:4317";

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(otelServiceName))
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri(otelEndpoint);
        }));


builder.Services.AddGrpc();

builder.Services.AddHttpClient("OsrmClient", client =>
{
    var osrmUrl = builder.Configuration["OSRM_URL"] ?? "http://osrm-server:5000/";
    client.BaseAddress = new Uri(osrmUrl);

    // sem timeout explícito o HttpClient usa o default de 100s: uma chamada ao OSRM
    // travado seguraria a thread do gRPC muito além do deadline do chamador (8s).
    client.Timeout = TimeSpan.FromSeconds(6);
});

builder.Services.AddScoped<IRoutingProvider, Features.ProcessamentoRotas.Providers.OsrmProvider>();
builder.Services.AddScoped<IRoteamentoService, RoteamentoLogic>();

var app = builder.Build();

app.MapGrpcService<RoteamentoService>();

app.MapGet("/", () => "Serviço de Roteamento gRPC ativo.");

app.Run();