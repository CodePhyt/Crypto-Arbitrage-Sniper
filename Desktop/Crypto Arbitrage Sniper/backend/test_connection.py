"""
Simple test script to verify backend setup and exchange connections.
Run this before starting the main server to ensure everything is configured correctly.
"""
import asyncio
import sys
from exchange_manager import ExchangeManager


async def test_exchanges():
    """Test connections to all exchanges."""
    print("Testing ArbHunter Backend Setup...\n")
    
    manager = ExchangeManager()
    
    test_symbol = 'BTC/USDT'
    exchanges = ['binance', 'mexc', 'kucoin']
    
    print(f"Testing ticker fetch for {test_symbol}...\n")
    
    for exchange_name in exchanges:
        try:
            print(f"Testing {exchange_name.upper()}...", end=" ")
            ticker = await manager.fetch_ticker(exchange_name, test_symbol)
            
            if ticker:
                print(f"✅ SUCCESS")
                print(f"   Bid: ${ticker['bid']}")
                print(f"   Ask: ${ticker['ask']}")
                print(f"   Last: ${ticker['last']}\n")
            else:
                print(f"❌ FAILED - No data returned\n")
        except Exception as e:
            print(f"❌ FAILED - {str(e)}\n")
    
    await manager.close_all()
    
    print("Test completed!")
    print("\nIf all exchanges show SUCCESS, you're ready to run the main server.")
    print("If any failed, check your internet connection and try again.")


if __name__ == "__main__":
    try:
        asyncio.run(test_exchanges())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)
