#include "csv.h"
#include <fstream>
#include <sstream>

std::vector<std::vector<std::string>> readCSV(const std::string& filename) {
    std::vector<std::vector<std::string>> data;
    std::ifstream file(filename);
    std::string line;

    while (getline(file, line)) {
        std::vector<std::string> row;
        std::stringstream ss(line);
        std::string cell;

        while (getline(ss, cell, ',')) {
            row.push_back(cell);
        }

        if (!row.empty()) {
            data.push_back(row);
        }
    }

    return data;
}

void appendCSV(const std::string& filename, const std::vector<std::string>& row) {
    std::ofstream file(filename, std::ios::app);
    for (size_t i = 0; i < row.size(); ++i) {
        file << row[i];
        if (i < row.size() - 1) file << ",";
    }
    file << "\n";
}
