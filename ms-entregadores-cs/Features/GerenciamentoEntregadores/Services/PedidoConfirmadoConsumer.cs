using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Features.GerenciamentoEntregadores.Contracts;
using Features.GerenciamentoEntregadores.Constants;

namespace Features.GerenciamentoEntregadores.Services
{
    public class PedidoConfirmadoConsumer : BackgroundService
    {
        private readonly ILogger<PedidoConfirmadoConsumer> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly string _host;
        private readonly int _port;
        private readonly string _username;
        private readonly string _password;

        private IConnection? _connection;
        private IModel? _channel;
        private const string ExchangeName = "delivery-events";
        private const string QueueName = "entregas.pedido-confirmado";
        private const string DlxExchangeName = "delivery-events.dlx";
        private const string DlqQueueName = "entregas.pedido-confirmado.dlq";
        private bool _isReconnecting = false;

        public PedidoConfirmadoConsumer(
            ILogger<PedidoConfirmadoConsumer> logger,
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;

            _host = configuration["RabbitMQ:Host"] ?? "localhost";
            _port = int.TryParse(configuration["RabbitMQ:Port"], out var port) ? port : 5672;
            _username = configuration["RabbitMQ:Username"] ?? "admin";
            _password = configuration["RabbitMQ:Password"] ?? "admin123";
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.Register(() => {
                _logger.LogInformation("Stopping RabbitMQ PedidoConfirmadoConsumer background service.");
                Cleanup();
            });

            InitializeRabbitMQ(stoppingToken);

            return Task.CompletedTask;
        }

        private void InitializeRabbitMQ(CancellationToken stoppingToken)
        {
            try
            {
                var factory = new ConnectionFactory()
                {
                    HostName = _host,
                    Port = _port,
                    UserName = _username,
                    Password = _password,
                    DispatchConsumersAsync = true
                };

                _connection = factory.CreateConnection();
                
                _connection.ConnectionShutdown += (sender, e) => {
                    _logger.LogWarning("RabbitMQ connection lost. Reconnecting...");
                    StartReconnectionLoop(stoppingToken);
                };

                _channel = _connection.CreateModel();

                _channel.ExchangeDeclare(DlxExchangeName, ExchangeType.Topic, durable: true);
                _channel.QueueDeclare(DlqQueueName, durable: true, exclusive: false, autoDelete: false);
                _channel.QueueBind(DlqQueueName, DlxExchangeName, "#");

                var queueArgs = new Dictionary<string, object>
                {
                    { "x-dead-letter-exchange", DlxExchangeName }
                };

                _channel.QueueDeclare(QueueName, durable: true, exclusive: false, autoDelete: false, arguments: queueArgs);
                
                _channel.ExchangeDeclare(ExchangeName, ExchangeType.Topic, durable: true);
                _channel.QueueBind(QueueName, ExchangeName, "pedido.confirmado");

                _logger.LogInformation("Successfully connected to RabbitMQ. Subscribed to queue {QueueName}.", QueueName);

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.Received += OnMessageReceived;

                _channel.BasicConsume(QueueName, autoAck: false, consumer: consumer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to RabbitMQ broker at startup. Reconnection scheduled.");
                StartReconnectionLoop(stoppingToken);
            }
        }

        private async Task OnMessageReceived(object sender, BasicDeliverEventArgs ea)
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            _logger.LogInformation("Received message from RabbitMQ with key '{RoutingKey}': {Message}", ea.RoutingKey, message);

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IEntregadorRepository>();
                var redisService = scope.ServiceProvider.GetRequiredService<ILocalizacaoRedisService>();

                var pedidoObj = JsonSerializer.Deserialize<PedidoConfirmadoPayload>(message, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (pedidoObj == null || pedidoObj.Id <= 0)
                {
                    throw new Exception("Invalid pedido.confirmado payload received.");
                }

                _logger.LogInformation("Processing delivery assignment for Pedido ID {PedidoId}.", pedidoObj.Id);

                // busca entregador mais próximo usando a latitude/longitude do destino (como fallback / referência)
                double lat = pedidoObj.Destino_Latitude ?? -22.9035;
                double lon = pedidoObj.Destino_Longitude ?? -43.1730;

                _logger.LogInformation("Searching for available drivers near target coordinate ({Lat}, {Lon})...", lat, lon);
                var entregadoresProximos = await redisService.BuscarIdsEntregadoresProximos(lat, lon, 10.0); // raio elástico de 10km para testes
                
                Entregador? melhorEntregador = null;
                
                if (entregadoresProximos != null && entregadoresProximos.Count > 0)
                {
                    var entregadoresNoBanco = await repository.ObterDadosEntregadoresPorIds(new List<int>(entregadoresProximos.Keys));
                    melhorEntregador = entregadoresNoBanco.Find(e => e.Status == StatusEntregadorConstants.Disponivel);
                }

                // se nenhum motorista próximo estiver DISPONIVEL, buscamos qualquer um no banco que esteja DISPONIVEL
                if (melhorEntregador == null)
                {
                    _logger.LogInformation("No drivers found near coordinates. Running global search for available drivers...");
                    var todos = await repository.ListarTodos();
                    melhorEntregador = todos.Find(e => e.Status == StatusEntregadorConstants.Disponivel);
                }

                if (melhorEntregador == null)
                {
                    throw new Exception($"Nenhum entregador disponível encontrado no sistema para o Pedido {pedidoObj.Id}. Enviando para DLQ.");
                }

                _logger.LogInformation("Driver '{DriverName}' (ID: {DriverId}) selected for Pedido {PedidoId}.", melhorEntregador.Nome, melhorEntregador.Id, pedidoObj.Id);

                // 1. atualiza status do entregador para EM_ENTREGA
                melhorEntregador.Status = StatusEntregadorConstants.EmEntrega;
                await repository.Atualizar(melhorEntregador);
                _logger.LogInformation("Driver {DriverId} status updated to EM_ENTREGA.", melhorEntregador.Id);

                // 2. publica evento entrega.atribuida de volta no RabbitMQ (Exchange: delivery-events)
                var responsePayload = new
                {
                    pedido_id = pedidoObj.Id,
                    entregador_id = melhorEntregador.Id,
                    status = "ATRIBUIDA"
                };

                var responseBody = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(responsePayload));
                
                _channel?.BasicPublish(
                    exchange: ExchangeName,
                    routingKey: "entrega.atribuida",
                    basicProperties: null,
                    body: responseBody
                );

                _logger.LogInformation("Published 'entrega.atribuida' event for Pedido {PedidoId} to Driver {DriverId}.", pedidoObj.Id, melhorEntregador.Id);

                // ack a mensagem original
                _channel?.BasicAck(ea.DeliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing pedido.confirmado message. Rejecting and sending to DLQ.");
                
                // envia para o DLQ (requeue = false)
                try
                {
                    _channel?.BasicNack(ea.DeliveryTag, multiple: false, requeue: false);
                }
                catch (Exception nackEx)
                {
                    _logger.LogError(nackEx, "Failed to NACK message.");
                }
            }
        }

        private void StartReconnectionLoop(CancellationToken stoppingToken)
        {
            if (_isReconnecting) return;
            _isReconnecting = true;

            Cleanup();

            Task.Run(async () =>
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("Attempting to reconnect to RabbitMQ in 10 seconds...");
                    await Task.Delay(10000, stoppingToken);

                    try
                    {
                        InitializeRabbitMQ(stoppingToken);
                        if (_connection != null && _connection.IsOpen)
                        {
                            _logger.LogInformation("RabbitMQ reconnection successful.");
                            _isReconnecting = false;
                            break;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Reconnection attempt failed.");
                    }
                }
            }, stoppingToken);
        }

        private void Cleanup()
        {
            try
            {
                _channel?.Close();
                _connection?.Close();
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Error closing RabbitMQ connection resources.");
            }
        }
    }

    public class PedidoConfirmadoPayload
    {
        public int Id { get; set; }
        public int Usuario_Id { get; set; }
        public int Restaurante_Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Valor_Total { get; set; }
        public double? Destino_Latitude { get; set; }
        public double? Destino_Longitude { get; set; }
    }
}
