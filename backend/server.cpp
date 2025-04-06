#include "server.h"
#include <iostream>
#include <thread>

#ifdef _WIN32
    // Windows-specific headers
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #include <windows.h>
    // Windows doesn't have unistd.h
    #define close closesocket
    
    // Define ssize_t for Windows
    #ifdef _WIN64
        typedef __int64 ssize_t;
    #else
        typedef int ssize_t;
    #endif
    
    // Define read function for Windows
    inline ssize_t read(SOCKET fd, void* buffer, size_t count) {
        return recv(fd, (char*)buffer, (int)count, 0);
    }
#else
    // UNIX/Linux/macOS headers
    #include <netinet/in.h>
    #include <unistd.h>
#endif

#include <cstring>
#include <sstream>
#include "handlers/auth.h"
#include "handlers/market.h"
#include "handlers/trade.h"
#include "handlers/portfolio.h"
#include <vector>
#include <ctime>
#include <iomanip>
#include <chrono>
#include <fstream>
#undef max



// Define Transaction structure
struct Transaction {
    std::string username;
    std::string ticker;
    std::string type;  // "BUY" or "SELL"
    int quantity;
    double price;
    std::string date;
};

// Vector to store all transactions
static std::vector<Transaction> transactions;
std::string getLast3BuysFromCSV(const std::string& username, const std::string& path = "db/transactions.csv") {
    std::ifstream file(path);
    std::string line;
    std::vector<std::string> matchingLines;

    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string user, type, ticker, quantityStr, priceStr;

        std::getline(ss, user, ',');
        std::getline(ss, type, ',');
        std::getline(ss, ticker, ',');
        std::getline(ss, quantityStr, ',');
        std::getline(ss, priceStr, ',');

        if (user == username && type == "BUY") {
            matchingLines.push_back(line);
        }
    }

    // Only keep the last 3
    int start = std::max(0, (int)matchingLines.size() - 3);
    std::stringstream result;
    result << "[";

    bool first = true;
    for (int i = start; i < matchingLines.size(); ++i) {
        std::stringstream ss(matchingLines[i]);
        std::string user, type, ticker, quantityStr, priceStr;
        std::getline(ss, user, ',');
        std::getline(ss, type, ',');
        std::getline(ss, ticker, ',');
        std::getline(ss, quantityStr, ',');
        std::getline(ss, priceStr, ',');

        if (!first) result << ",";
        first = false;

        result << "{"
               << "\"username\":\"" << user << "\","
               << "\"type\":\"" << type << "\","
               << "\"ticker\":\"" << ticker << "\","
               << "\"quantity\":" << quantityStr << ","
               << "\"price\":" << priceStr << ","
               << "\"total\":" << std::stod(quantityStr) * std::stod(priceStr)
               << "}";
    }

    result << "]";
    return result.str();
}


Server::Server(int port) : port(port) {}  // ✅ this defines the constructor

void Server::start() {
#ifdef _WIN32
    // Initialize Winsock
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "Failed to initialize Winsock" << std::endl;
        return;
    }
    std::cout << "Winsock initialized successfully" << std::endl;
#endif

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        std::cerr << "Socket creation failed with error: " <<
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
            << std::endl;
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }
    std::cout << "Socket created successfully" << std::endl;

    // Optional: Set socket to reuse address
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt)) < 0) {
        std::cerr << "setsockopt failed" << std::endl;
        close(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }

    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        std::cerr << "Bind failed with error: " <<
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
            << std::endl;
        close(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }
    std::cout << "Bind successful" << std::endl;

    if (listen(server_fd, 5) < 0) {
        std::cerr << "Listen failed with error: " <<
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
            << std::endl;
        close(server_fd);
#ifdef _WIN32
        WSACleanup();
#endif
        return;
    }

    std::cout << "Server listening on port " << port << std::endl;

    // ✅ Load saved transactions from file
    //loadTransactionsFromCSV("db/transactions.csv");

    while (true) {
        std::cout << "Waiting for connection..." << std::endl;
        int client_socket = accept(server_fd, nullptr, nullptr);
        if (client_socket < 0) {
            std::cerr << "Accept failed with error: " <<
#ifdef _WIN32
                WSAGetLastError()
#else
                errno
#endif
                << std::endl;
            continue;
        }
        std::cout << "Client connected" << std::endl;
        std::thread(&Server::handleClient, this, client_socket).detach();
    }

    // Cleanup (though this part won't be reached in this implementation)
    close(server_fd);
#ifdef _WIN32
    WSACleanup();
#endif
}


// Parse an HTTP request to extract the command
std::string Server::parseHttpRequest(const std::string& request) {
    // Check if this is a GET request
    if (request.substr(0, 3) == "GET") {
        // Format: GET /COMMAND HTTP/1.1
        size_t start = request.find('/') + 1;
        size_t end = request.find(' ', start);
        if (start != std::string::npos && end != std::string::npos) {
            return request.substr(start, end - start);
        }
    }
    // Check if this is a POST request with a body
    else if (request.substr(0, 4) == "POST") {
        // Look for the empty line separating headers from body
        size_t headerEnd = request.find("\r\n\r\n");
        if (headerEnd != std::string::npos) {
            // Return the body content
            return request.substr(headerEnd + 4);
        }
    }
    
    // If we can't parse it as HTTP, return it as is
    // (for backward compatibility with direct TCP commands)
    return request;
}

// Create an HTTP response
std::string Server::createHttpResponse(const std::string& content, bool success) {
    std::stringstream response;
    response << "HTTP/1.1 " << (success ? "200 OK" : "400 Bad Request") << "\r\n";
    response << "Content-Type: text/plain\r\n";
    response << "Access-Control-Allow-Origin: *\r\n";  // CORS header
    response << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
    response << "Access-Control-Allow-Headers: Content-Type\r\n";
    response << "Content-Length: " << content.length() << "\r\n";
    response << "\r\n"; // End of headers
    response << content;
    
    return response.str();
}

void Server::handleClient(int clientSocket) {
    char buffer[4096] = {0};
    read(clientSocket, buffer, 4096);
    std::string requestData(buffer);
    
    // Extract command from HTTP request if present
    std::string command = parseHttpRequest(requestData);
    std::cout << "Received command: " << command << std::endl;
    
    std::string result;
    bool success = true;

    // Process the command
    if (command.rfind("LOGIN|", 0) == 0) {
        auto parts = command.substr(6);
        auto pos = parts.find("|");
        if (pos != std::string::npos) {
            std::string username = parts.substr(0, pos);
            std::string password = parts.substr(pos+1);
            result = loginUser(username, password) ? "OK|Login successful" : "ERROR|Invalid credentials";
            success = result.substr(0, 2) == "OK";
        } else {
            result = "ERROR|Invalid format";
            success = false;
        }
    } else if (command.rfind("REGISTER|", 0) == 0) {
        auto parts = command.substr(9);
        auto pos = parts.find("|");
        if (pos != std::string::npos) {
            std::string username = parts.substr(0, pos);
            std::string password = parts.substr(pos+1);
            result = registerUser(username, password) ? "OK|User registered" : "ERROR|User exists";
            success = result.substr(0, 2) == "OK";
        } else {
            result = "ERROR|Invalid format";
            success = false;
        }
    } else if (command == "GET_MARKET") {
        result = getMarketData();
        success = true;
    } else if (command.rfind("BUY|", 0) == 0) {
        auto parts = command.substr(4);
        auto pos1 = parts.find("|");
        auto pos2 = parts.rfind("|");
        std::string user = parts.substr(0, pos1);
        std::string ticker = parts.substr(pos1+1, pos2-pos1-1);
        int qty = std::stoi(parts.substr(pos2+1));
        result = buyStock(user, ticker, qty) ? "OK|Trade completed" : "ERROR|Buy failed";
        success = result.substr(0, 2) == "OK";
        } else if (command.rfind("SELL|", 0) == 0) {
        auto parts = command.substr(5);
        auto pos1 = parts.find("|");
        auto pos2 = parts.rfind("|");
        std::string user = parts.substr(0, pos1);
        std::string ticker = parts.substr(pos1+1, pos2-pos1-1);
        int qty = std::stoi(parts.substr(pos2+1));
        result = sellStock(user, ticker, qty) ? "OK|Trade completed" : "ERROR|Sell failed";
        success = result.substr(0, 2) == "OK";
    } else if (command.rfind("PORTFOLIO|", 0) == 0) {
        std::string username = command.substr(10);
        result = getPortfolio(username);
        success = true;
    } else if (command.rfind("OPTIONS", 0) == 0 || requestData.rfind("OPTIONS", 0) == 0) {
        // Handle preflight CORS requests
        result = "";
        success = true;
    } else if (command.rfind("CSV_BUYS|", 0) == 0) {
        std::string username = command.substr(9);
        result = getLast3BuysFromCSV(username);
        success = true;    
    } else {
        result = "ERROR|Unknown command";
        success = false;
    }

    // Create HTTP response
    std::string response = createHttpResponse(result, success);
    
    // Send response
    send(clientSocket, response.c_str(), response.size(), 0);
    close(clientSocket);
}