import sys
from messaging.consumer import RabbitMQConsumer

def main():
    print("=========================================")
    print("Starting MS Notificações (Python)...")
    print("=========================================")
    
    consumer = RabbitMQConsumer()
    
    try:
        consumer.start()
    except KeyboardInterrupt:
        print("\nShutdown requested. Exiting...")
        consumer.stop()
        sys.exit(0)

if __name__ == "__main__":
    main()
