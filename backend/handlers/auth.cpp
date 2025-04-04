#include "auth.h"
#include "../utils/csv.h"
#include <vector>
#include <mutex>

std::mutex auth_mutex;
const std::string USERS_FILE = "db/users.csv";

// In auth.cpp
bool loginUser(const std::string& username, const std::string& password) {
    std::lock_guard<std::mutex> lock(auth_mutex);
    auto users = readCSV(USERS_FILE);
    for (auto& row : users) {
        if (row.size() >= 2 && row[0] == username && row[1] == password) {
            return true;
        }
    }
    return false;
}

bool registerUser(const std::string& username, const std::string& password) {
    std::lock_guard<std::mutex> lock(auth_mutex);
    auto users = readCSV(USERS_FILE);
    for (auto& row : users) {
        if (!row.empty() && row[0] == username) return false;
    }
    appendCSV(USERS_FILE, {username, password});
    return true;
}