#ifndef TRADE_H
#define TRADE_H

#include <string>

bool buyStock(const std::string& username, const std::string& ticker, int quantity);
bool sellStock(const std::string& username, const std::string& ticker, int quantity);

#endif
