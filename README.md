## ✅ Backend Progress Summary

Implemented a fully functional C++ backend for the stock trading platform. It satisfies all SE3313A project requirements — including concurrency, persistent CSV-based storage, TCP socket communication, and multi-user interaction.

### Features

- 🧠 **Login & Register**  
  Users can register or log in with a username. All user data is stored in `users.csv`.

- 📈 **Live Market Data**  
  Stock market data is pulled from `market.csv`, with each entry formatted as:  
  `ticker,company name,current price`

- 💸 **Buy/Sell Engine**  
  Handles buying and selling of stocks with full validation.  
  Updates `holdings.csv` and logs every transaction to `transactions.csv`.  
  All operations are thread-safe using `std::mutex`.

- 📊 **Portfolio Viewer**  
  Users can view their owned stocks and quantities with the `PORTFOLIO|username` command.

- 📁 **CSV-Based Persistent Storage**  
  All user, market, and transaction data is stored in flat CSV files.  
  The system ensures safe concurrent access during read/write operations.

- 🧵 **Multithreaded TCP Server**  
  Each connected client is handled on its own thread via `std::thread`.  
  All frontend/backend communication is over raw TCP sockets.

### How to Compile & Run (after making new changes this starts backend)

1. Compile the server:
g++ -std=c++17 -pthread main.cpp server.cpp handlers/*.cpp utils/*.cpp -o server

2. Run the server:
./server

3. Run frontend
npm run dev

## Market Data Updates:
The application uses real-time stock data that is stored in `db/market.csv`. To update this data:

1. Make sure you have Python and the required packages installed:
   pip install requests
2. Run the market updater script:
cd backend
python market_updater.py

