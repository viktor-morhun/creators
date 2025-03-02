import asyncio
import signal
import sys
import uvicorn
from server import app
from blockchain_listener import BlockchainListener
from config import HOST, PORT, SYNC_INTERVAL

# Store tasks so we can cancel them
server_task = None
listener_task = None
shutdown_event = None


# Define the server
async def run_server():
    config = uvicorn.Config(app, host=HOST, port=PORT)
    server = uvicorn.Server(config)
    await server.serve()


# Define the blockchain listener
async def run_listener():
    listener = BlockchainListener()
    await listener.start_listening(SYNC_INTERVAL)


# Signal handler for Windows and Unix
def signal_handler(sig, frame):
    print(f"\nReceived exit signal {sig}")
    if shutdown_event:
        shutdown_event.set()


# Handle graceful shutdown
async def shutdown():
    """Clean up tasks and perform graceful shutdown"""
    # Cancel our tasks
    if server_task and not server_task.done():
        server_task.cancel()
    if listener_task and not listener_task.done():
        listener_task.cancel()

    # Wait until all tasks are canceled
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    for task in tasks:
        task.cancel()
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)

    print("Shutdown complete. Goodbye!")
    # Terminate with success status
    sys.exit(0)


# Run both concurrently
async def main():
    global server_task, listener_task, shutdown_event

    # Create a shutdown event
    shutdown_event = asyncio.Event()

    # Register signal handlers - works on both Windows and Unix
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        print(f"Starting auction caching server on {HOST}:{PORT}")
        print(f"Blockchain listener will sync every {SYNC_INTERVAL} seconds")
        print("Press CTRL+C to exit")

        # Create tasks
        server_task = asyncio.create_task(run_server())
        listener_task = asyncio.create_task(run_listener())

        # Wait for shutdown signal
        await shutdown_event.wait()
        await shutdown()
    except asyncio.CancelledError:
        # This is expected when tasks are canceled during shutdown
        pass
    except Exception as e:
        print(f"Unexpected error: {e}")
        await shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # This should be caught by the signal handler but just in case
        print("KeyboardInterrupt received, shutting down...")
