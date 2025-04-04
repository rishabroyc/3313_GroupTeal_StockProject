#include "market.h"
#include "../utils/csv.h"
#include <sstream>

const std::string MARKET_FILE = "db/market.csv";

std::string getMarketData() {
    std::ostringstream oss;
    auto data = readCSV(MARKET_FILE);

    for (const auto& row : data) {
        if (row.size() >= 3) {
            oss << row[0] << "," << row[1] << "," << row[2] << ";";
        }
    }

    return "DATA|" + oss.str();
}
