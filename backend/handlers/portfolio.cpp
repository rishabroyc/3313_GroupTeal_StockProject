#include "portfolio.h"
#include "../utils/csv.h"
#include <sstream>

const std::string HOLDINGS_FILE = "db/holdings.csv";

std::string getPortfolio(const std::string& username) {
    std::ostringstream oss;
    auto data = readCSV(HOLDINGS_FILE);

    for (const auto& row : data) {
        if (row.size() >= 3 && row[0] == username) {
            oss << row[1] << "," << row[2] << ";";  // ticker, quantity
        }
    }

    return "DATA|" + oss.str();
}
