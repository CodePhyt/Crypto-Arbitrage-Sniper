import ccxt.async_support as ccxt
from typing import Dict, Optional
import asyncio


class ExchangeManager:
    """Manages connections to multiple cryptocurrency exchanges."""
    
    def __init__(self):
        self.exchanges: Dict[str, ccxt.Exchange] = {}
        self._initialize_exchanges()
    
    def _initialize_exchanges(self):
        """Initialize exchange connections."""
        self.exchanges['binance'] = ccxt.binance({
            'apiKey': '',
            'secret': '',
            'enableRateLimit': True,
            'options': {'defaultType': 'spot'}
        })
        
        self.exchanges['mexc'] = ccxt.mexc({
            'apiKey': '',
            'secret': '',
            'enableRateLimit': True,
        })
        
        self.exchanges['kucoin'] = ccxt.kucoin({
            'apiKey': '',
            'secret': '',
            'password': '',
            'enableRateLimit': True,
        })
    
    async def fetch_ticker(self, exchange_name: str, symbol: str) -> Optional[Dict]:
        """Fetch ticker data for a symbol from an exchange."""
        try:
            exchange = self.exchanges.get(exchange_name)
            if not exchange:
                return None
            
            ticker = await exchange.fetch_ticker(symbol)
            return {
                'symbol': symbol,
                'exchange': exchange_name,
                'bid': ticker['bid'],
                'ask': ticker['ask'],
                'last': ticker['last'],
                'timestamp': ticker['timestamp']
            }
        except Exception as e:
            print(f"Error fetching {symbol} from {exchange_name}: {e}")
            return None
    
    async def fetch_all_tickers(self, exchange_name: str, symbols: list) -> Dict[str, Dict]:
        """Fetch multiple tickers concurrently from an exchange."""
        tasks = [self.fetch_ticker(exchange_name, symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        tickers = {}
        for result in results:
            if isinstance(result, dict) and result:
                tickers[result['symbol']] = result
            elif isinstance(result, Exception):
                print(f"Exception in fetch_all_tickers: {result}")
        
        return tickers
    
    async def close_all(self):
        """Close all exchange connections."""
        for exchange in self.exchanges.values():
            try:
                await exchange.close()
            except Exception as e:
                print(f"Error closing exchange: {e}")
