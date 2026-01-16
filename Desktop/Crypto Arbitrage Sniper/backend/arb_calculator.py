from typing import Dict, List, Optional, Tuple


class ArbCalculator:
    """Calculates arbitrage opportunities between exchanges."""
    
    TAKER_FEE_PER_TRADE = 0.001
    TOTAL_FEE = TAKER_FEE_PER_TRADE * 2
    MIN_PROFIT_THRESHOLD = 0.005
    
    @staticmethod
    def calculate_profit(lower_price: float, higher_price: float) -> float:
        """Calculate gross profit percentage."""
        if lower_price <= 0:
            return 0.0
        return ((higher_price - lower_price) / lower_price) * 100
    
    @staticmethod
    def calculate_net_profit(lower_price: float, higher_price: float) -> float:
        """Calculate net profit after fees."""
        gross_profit_pct = ArbCalculator.calculate_profit(lower_price, higher_price)
        net_profit_pct = gross_profit_pct - (ArbCalculator.TOTAL_FEE * 100)
        return net_profit_pct
    
    @staticmethod
    def find_arbitrage_opportunity(
        symbol: str,
        exchange_tickers: Dict[str, Dict]
    ) -> Optional[Dict]:
        """
        Find arbitrage opportunity for a symbol across exchanges.
        
        Returns:
            Dict with opportunity details or None if no profitable opportunity.
        """
        if len(exchange_tickers) < 2:
            return None
        
        exchanges = list(exchange_tickers.keys())
        best_buy = None
        best_sell = None
        best_net_profit = 0.0
        
        for i, buy_exchange in enumerate(exchanges):
            buy_ticker = exchange_tickers[buy_exchange]
            if not buy_ticker or buy_ticker.get('ask') is None:
                continue
            
            for j, sell_exchange in enumerate(exchanges):
                if i == j:
                    continue
                
                sell_ticker = exchange_tickers[sell_exchange]
                if not sell_ticker or sell_ticker.get('bid') is None:
                    continue
                
                buy_price = buy_ticker['ask']
                sell_price = sell_ticker['bid']
                
                if sell_price > buy_price:
                    net_profit = ArbCalculator.calculate_net_profit(buy_price, sell_price)
                    
                    if net_profit > best_net_profit and net_profit > ArbCalculator.MIN_PROFIT_THRESHOLD * 100:
                        best_net_profit = net_profit
                        best_buy = {
                            'exchange': buy_exchange,
                            'price': buy_price,
                            'ticker': buy_ticker
                        }
                        best_sell = {
                            'exchange': sell_exchange,
                            'price': sell_price,
                            'ticker': sell_ticker
                        }
        
        if best_buy and best_sell:
            return {
                'symbol': symbol,
                'buy_exchange': best_buy['exchange'],
                'buy_price': best_buy['price'],
                'sell_exchange': best_sell['exchange'],
                'sell_price': best_sell['price'],
                'net_profit_pct': round(best_net_profit, 4),
                'gross_profit_pct': round(
                    ArbCalculator.calculate_profit(best_buy['price'], best_sell['price']),
                    4
                ),
                'timestamp': best_buy['ticker']['timestamp']
            }
        
        return None
    
    @staticmethod
    def scan_all_symbols(
        all_tickers: Dict[str, Dict[str, Dict]]
    ) -> List[Dict]:
        """Scan all symbols for arbitrage opportunities."""
        opportunities = []
        
        for symbol, exchange_tickers in all_tickers.items():
            opportunity = ArbCalculator.find_arbitrage_opportunity(
                symbol, exchange_tickers
            )
            if opportunity:
                opportunities.append(opportunity)
        
        return sorted(opportunities, key=lambda x: x['net_profit_pct'], reverse=True)
