#!/usr/bin/env python3
import requests
import csv
import time
import os
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("market_updater.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger()

# Replace with your Alpha Vantage API key
# Get a free API key from: https://www.alphavantage.co/support/#api-key
API_KEY = "X5FAF3SDJBEEO7D4"

# Stocks to track - you can add more symbols here
symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]

# Path to market.csv - adjust according to your directory structure
MARKET_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db/market.csv")

def fetch_stock_data(symbol):
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
    
    try:
        logger.info(f"Fetching data for {symbol}")
        response = requests.get(url)
        data = response.json()
        
        # Check for errors or rate limits in the response
        if "Error Message" in data:
            logger.error(f"API Error: {data['Error Message']}")
            return None
        if "Note" in data and "API call frequency" in data["Note"]:
            logger.warning(f"API rate limit reached: {data['Note']}")
            time.sleep(15)  # Wait a little longer if we hit rate limits
            return None
            
        if "Global Quote" in data and "05. price" in data["Global Quote"]:
            price = float(data["Global Quote"]["05. price"])
            
            # For company name, we'll use a simple mapping
            # In a production environment, you'd want to fetch real company names
            company_names = {
                "AAPL": "Apple Inc.",
                "MSFT": "Microsoft Corporation",
                "GOOGL": "Alphabet Inc.",
                "AMZN": "Amazon.com Inc.",
                "TSLA": "Tesla Inc."
            }
            
            name = company_names.get(symbol, symbol)
            logger.info(f"Successfully fetched {symbol} at ${price}")
            return symbol, name, price
        else:
            logger.error(f"Unexpected response format for {symbol}: {data}")
            return None
    except Exception as e:
        logger.error(f"Exception fetching {symbol}: {e}")
        return None

def update_market_csv():
    logger.info(f"Starting market data update")
    
    # Make sure the directory exists
    os.makedirs(os.path.dirname(MARKET_FILE), exist_ok=True)
    
    # First try to read existing data to preserve entries that we don't update
    existing_data = {}
    try:
        if os.path.exists(MARKET_FILE):
            with open(MARKET_FILE, 'r') as file:
                reader = csv.reader(file)
                for row in reader:
                    if len(row) >= 3:
                        existing_data[row[0]] = row
    except Exception as e:
        logger.error(f"Error reading existing market data: {e}")
    
    updated_data = []
    success_count = 0
    
    for symbol in symbols:
        result = fetch_stock_data(symbol)
        if result:
            symbol, name, price = result
            updated_data.append([symbol, name, str(price)])
            success_count += 1
        else:
            # Use existing data for this symbol if available
            if symbol in existing_data:
                updated_data.append(existing_data[symbol])
                logger.warning(f"Using cached data for {symbol}")
        
        # Sleep to avoid API rate limits (Alpha Vantage limits to 5 calls per minute for free API)
        time.sleep(12)
    
    # Write updated data to CSV
    if updated_data:
        try:
            with open(MARKET_FILE, 'w', newline='') as file:
                writer = csv.writer(file)
                writer.writerows(updated_data)
            logger.info(f"Successfully updated market.csv with {len(updated_data)} stocks ({success_count} fresh updates)")
        except Exception as e:
            logger.error(f"Error writing to market.csv: {e}")
    else:
        logger.error("No data to write to market.csv")

if __name__ == "__main__":
    update_market_csv()