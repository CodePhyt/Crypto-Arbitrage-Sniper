from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Set, Dict
import json
import asyncio
from exchange_manager import ExchangeManager
from market_scanner import MarketScanner
from arb_calculator import ArbCalculator


app = FastAPI(title="ArbHunter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

exchange_manager = ExchangeManager()
arb_calculator = ArbCalculator()
market_scanner = MarketScanner(exchange_manager, arb_calculator)

active_connections: Set[WebSocket] = set()
scan_task = None


async def broadcast_opportunity(opportunity: Dict):
    """Broadcast arbitrage opportunity to all connected clients."""
    if not active_connections:
        return
    
    message = json.dumps({
        'type': 'opportunity',
        'data': opportunity
    })
    
    disconnected = set()
    for connection in active_connections:
        try:
            await connection.send_text(message)
        except Exception as e:
            print(f"Error broadcasting to connection: {e}")
            disconnected.add(connection)
    
    active_connections.difference_update(disconnected)


async def broadcast_ticker_update(ticker_data: Dict):
    """Broadcast ticker price updates to all connected clients."""
    if not active_connections:
        return
    
    message = json.dumps({
        'type': 'ticker',
        'data': ticker_data
    })
    
    disconnected = set()
    for connection in active_connections:
        try:
            await connection.send_text(message)
        except Exception as e:
            print(f"Error broadcasting ticker: {e}")
            disconnected.add(connection)
    
    active_connections.difference_update(disconnected)


async def ticker_broadcast_loop():
    """Continuously fetch and broadcast ticker updates."""
    while True:
        try:
            all_tickers = await market_scanner.fetch_all_exchange_tickers()
            
            ticker_summary = {}
            for symbol, exchange_tickers in all_tickers.items():
                prices = []
                for exchange_name, ticker in exchange_tickers.items():
                    if ticker and ticker.get('last'):
                        prices.append({
                            'exchange': exchange_name,
                            'price': ticker['last']
                        })
                
                if prices:
                    avg_price = sum(p['price'] for p in prices) / len(prices)
                    ticker_summary[symbol] = {
                        'symbol': symbol,
                        'avg_price': avg_price,
                        'exchanges': prices
                    }
            
            await broadcast_ticker_update(ticker_summary)
            await asyncio.sleep(1.0)
        except Exception as e:
            print(f"Error in ticker broadcast loop: {e}")
            await asyncio.sleep(1.0)


@app.on_event("startup")
async def startup_event():
    """Start background scanning tasks."""
    global scan_task
    
    scan_task = asyncio.create_task(
        market_scanner.scan_loop(broadcast_opportunity)
    )
    
    asyncio.create_task(ticker_broadcast_loop())
    print("ArbHunter backend started - Scanning for opportunities...")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    global scan_task
    
    market_scanner.stop()
    if scan_task:
        scan_task.cancel()
    
    await exchange_manager.close_all()
    print("ArbHunter backend stopped")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "status": "ArbHunter API is running",
        "exchanges": ["binance", "mexc", "kucoin"],
        "active_connections": len(active_connections)
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time arbitrage opportunities."""
    await websocket.accept()
    active_connections.add(websocket)
    
    try:
        await websocket.send_text(json.dumps({
            'type': 'connected',
            'message': 'Connected to ArbHunter WebSocket'
        }))
        
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get('type') == 'ping':
                    await websocket.send_text(json.dumps({'type': 'pong'}))
            except json.JSONDecodeError:
                pass
    
    except WebSocketDisconnect:
        active_connections.discard(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        active_connections.discard(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
