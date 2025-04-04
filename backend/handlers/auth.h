#ifndef AUTH_H
#define AUTH_H

#include <string>

bool loginUser(const std::string& username, const std::string& password);
bool registerUser(const std::string& username, const std::string& password);

#endif
