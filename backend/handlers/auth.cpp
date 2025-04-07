#include "auth.h"
#include "../utils/csv.h"
#include <vector>
#include <mutex>
#include <algorithm> // for std::remove_if

std::mutex auth_mutex;
const std::string USERS_FILE = "db/users.csv";


std::string trim(const std::string& str) {
    std::string result = str;
    result.erase(std::remove_if(result.begin(), result.end(), [](char c) {
        return c == '\r' || c == '\n';
    }), result.end());
    return result;
}

bool loginUser(const std::string& username, const std::string& password) {
    std::lock_guard<std::mutex> lock(auth_mutex);
    auto users = readCSV(USERS_FILE);
    for (auto& row : users) {
        if (row.size() >= 2) {
            std::string storedUser = trim(row[0]);
            std::string storedPass = trim(row[1]);
            if (storedUser == username && storedPass == password) {
                return true;
            }
        }
    }
    return false;
}


bool registerUser(const std::string& username, const std::string& password) {
    std::lock_guard<std::mutex> lock(auth_mutex);
    auto users = readCSV(USERS_FILE);
    for (auto& row : users) {
        if (!row.empty() && trim(row[0]) == username) return false;
    }
    appendCSV(USERS_FILE, {trim(username), trim(password)});
    return true;
}
