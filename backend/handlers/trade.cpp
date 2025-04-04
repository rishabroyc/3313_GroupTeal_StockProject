#include "trade.h"
#include "../utils/csv.h"
#include <vector>
#include <string>
#include <mutex>
#include <fstream>

const std::string MARKET_FILE = "db/market.csv";
const std::string HOLDINGS_FILE = "db/holdings.csv";
const std::string TRANSACTIONS_FILE = "db/transactions.csv";

std::mutex trade_mutex;

float getPrice(const std::string& ticker) {
    auto market = readCSV(MARKET_FILE);
    for (auto& row : market) {
        if (row.size() >= 3 && row[0] == ticker) {
            return std::stof(row[2]);
        }
    }
    return -1.0f;
}

bool buyStock(const std::string& username, const std::string& ticker, int quantity) {
    std::lock_guard<std::mutex> lock(trade_mutex);
    float price = getPrice(ticker);
    if (price <= 0) return false;

    auto holdings = readCSV(HOLDINGS_FILE);
    bool found = false;

    for (auto& row : holdings) {
        if (row.size() >= 3 && row[0] == username && row[1] == ticker) {
            int currentQty = std::stoi(row[2]);
            row[2] = std::to_string(currentQty + quantity);
            found = true;
            break;
        }
    }

    if (!found) {
        holdings.push_back({username, ticker, std::to_string(quantity)});
    }

    writeCSV(HOLDINGS_FILE, holdings);
    appendCSV(TRANSACTIONS_FILE, {username, "BUY", ticker, std::to_string(quantity), std::to_string(price)});
    return true;
}

bool sellStock(const std::string& username, const std::string& ticker, int quantity) {
    std::lock_guard<std::mutex> lock(trade_mutex);
    float price = getPrice(ticker);
    if (price <= 0) return false;

    auto holdings = readCSV(HOLDINGS_FILE);
    for (auto& row : holdings) {
        if (row.size() >= 3 && row[0] == username && row[1] == ticker) {
            int currentQty = std::stoi(row[2]);
            if (currentQty < quantity) return false;

            row[2] = std::to_string(currentQty - quantity);
            writeCSV(HOLDINGS_FILE, holdings);
            appendCSV(TRANSACTIONS_FILE, {username, "SELL", ticker, std::to_string(quantity), std::to_string(price)});
            return true;
        }
    }

    return false;
}
