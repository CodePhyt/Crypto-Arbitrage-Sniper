from typing import Dict, List
import asyncio
from exchange_manager import ExchangeManager
from arb_calculator import ArbCalculator


class MarketScanner:
    """Scans markets for arbitrage opportunities."""
    
    TOP_SYMBOLS = [
        'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
        'USDC/USDT', 'DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 'TRX/USDT',
        'MATIC/USDT', 'LINK/USDT', 'DOT/USDT', 'UNI/USDT', 'LTC/USDT',
        'ATOM/USDT', 'ETC/USDT', 'XLM/USDT', 'ALGO/USDT', 'VET/USDT',
        'FIL/USDT', 'ICP/USDT', 'APT/USDT', 'ARB/USDT', 'OP/USDT',
        'NEAR/USDT', 'AAVE/USDT', 'MKR/USDT', 'SAND/USDT', 'MANA/USDT',
        'AXS/USDT', 'GALA/USDT', 'ENJ/USDT', 'CHZ/USDT', 'FLOW/USDT',
        'EGLD/USDT', 'HBAR/USDT', 'THETA/USDT', 'ZIL/USDT', 'IOTA/USDT',
        'EOS/USDT', 'XTZ/USDT', 'WAVES/USDT', 'KSM/USDT', 'GRT/USDT',
        'SNX/USDT', 'COMP/USDT', 'YFI/USDT', 'SUSHI/USDT', 'CRV/USDT',
    ]
    
    def __init__(self, exchange_manager: ExchangeManager, arb_calculator: ArbCalculator):
        self.exchange_manager = exchange_manager
        self.arb_calculator = arb_calculator
        self.scan_interval = 3.0
        self.is_scanning = False
    
    async def fetch_all_exchange_tickers(self) -> Dict[str, Dict[str, Dict]]:
        """Fetch tickers for all symbols from all exchanges concurrently."""
        exchange_names = ['binance', 'mexc', 'kucoin']
        
        tasks = []
        for exchange_name in exchange_names:
            task = self.exchange_manager.fetch_all_tickers(
                exchange_name, self.TOP_SYMBOLS
            )
            tasks.append((exchange_name, task))
        
        all_tickers = {}
        
        results = await asyncio.gather(
            *[task for _, task in tasks],
            return_exceptions=True
        )
        
        for (exchange_name, _), result in zip(tasks, results):
            if isinstance(result, Exception):
                print(f"Error fetching from {exchange_name}: {result}")
                continue
            
            for symbol, ticker in result.items():
                if symbol not in all_tickers:
                    all_tickers[symbol] = {}
                all_tickers[symbol][exchange_name] = ticker
        
        return all_tickers
    
    async def scan_once(self) -> List[Dict]:
        """Perform a single scan for arbitrage opportunities."""
        all_tickers = await self.fetch_all_exchange_tickers()
        opportunities = self.arb_calculator.scan_all_symbols(all_tickers)
        return opportunities
    
    async def scan_loop(self, callback):
        """Continuously scan markets and call callback with opportunities."""
        self.is_scanning = True
        
        while self.is_scanning:
            try:
                opportunities = await self.scan_once()
                
                if opportunities:
                    for opportunity in opportunities:
                        await callback(opportunity)
                
                await asyncio.sleep(self.scan_interval)
            except Exception as e:
                print(f"Error in scan loop: {e}")
                await asyncio.sleep(self.scan_interval)
    
    def stop(self):
        """Stop the scanning loop."""
        self.is_scanning = False
