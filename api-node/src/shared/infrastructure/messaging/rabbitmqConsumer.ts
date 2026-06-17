import amqp from 'amqplib';
import { diContainer } from '../container.js';

export class RabbitMQConsumer {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchangeName = 'delivery-events';
  private readonly queueName = 'api.entrega-atribuida';
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {}

  async connect(): Promise<void> {
    if (this.connection && this.channel) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const user = process.env.RABBIT_USER || 'admin';
    const pass = process.env.RABBIT_PASS || 'admin123';
    const host = process.env.RABBIT_HOST || 'localhost';
    const port = process.env.RABBIT_PORT || '5672';
    const url = `amqp://${user}:${pass}@${host}:${port}`;

    try {
      console.log(`[Consumer] Connecting to RabbitMQ at ${host}:${port}...`);
      const conn = await amqp.connect(url);

      conn.on('error', (err: Error) => {
        console.error('[Consumer] RabbitMQ connection error:', err);
        this.handleDisconnect();
      });

      conn.on('close', (reason?: Error) => {
        console.log('[Consumer] RabbitMQ connection closed:', reason);
        this.handleDisconnect();
      });

      const chan = await conn.createChannel();

      chan.on('error', (err: Error) => {
        console.error('[Consumer] RabbitMQ channel error:', err);
      });

      chan.on('close', () => {
        console.log('[Consumer] RabbitMQ channel closed.');
        this.channel = null;
      });

      await chan.assertExchange(this.exchangeName, 'topic', { durable: true });
      await chan.assertQueue(this.queueName, { durable: true });
      await chan.bindQueue(this.queueName, this.exchangeName, 'entrega.atribuida');

      this.connection = conn;
      this.channel = chan;

      console.log(`[Consumer] Connected to RabbitMQ. Listening on queue '${this.queueName}'...`);

      await chan.consume(this.queueName, async (msg) => {
        if (!msg) return;

        try {
          const content = msg.content.toString();
          console.log(`[Consumer] Received event 'entrega.atribuida':`, content);

          const payload = JSON.parse(content);
          const { pedido_id, entregador_id, status } = payload;

          if (!pedido_id || !entregador_id) {
            throw new Error('Invalid payload received for entrega.atribuida');
          }

          const entregaService = diContainer.getEntregaService();
          
          const existing = await entregaService.buscarPorPedidoId(pedido_id);
          if (existing && existing.length > 0) {
            console.log(`[Consumer] Delivery for Pedido ID ${pedido_id} already exists. Skipping.`);
          } else {
            const entrega = await entregaService.criar({
              pedido_id,
              entregador_id,
              status: status || 'ATRIBUIDA'
            });
            console.log(`[Consumer] Delivery created successfully in database:`, entrega);
          }

          chan.ack(msg);
        } catch (err) {
          console.error(`[Consumer] Error processing message:`, err);
          chan.nack(msg, false, false);
        }
      });

    } catch (err) {
      console.error('[Consumer] Failed to connect to RabbitMQ:', err);
      this.handleDisconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private handleDisconnect(): void {
    if (this.connection) {
      const conn = this.connection;
      try {
        conn.close().catch(() => {});
      } catch (e) {}
    }
    this.connection = null;
    this.channel = null;

    if (!this.reconnectTimeout && !this.isConnecting) {
      console.log('[Consumer] Scheduling RabbitMQ reconnection in 5s...');
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect().catch((err) => {
          console.error('[Consumer] Reconnection attempt failed:', err);
        });
      }, 5000);
    }
  }
}

export const rabbitMQConsumer = new RabbitMQConsumer();
export default rabbitMQConsumer;
