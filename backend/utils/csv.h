#ifndef CSV_H
#define CSV_H

#include <string>
#include <vector>

std::vector<std::vector<std::string>> readCSV(const std::string& filename);
void appendCSV(const std::string& filename, const std::vector<std::string>& row);
void writeCSV(const std::string& filename, const std::vector<std::vector<std::string>>& rows);

#endif
