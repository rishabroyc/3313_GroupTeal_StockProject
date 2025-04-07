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
#include <unordered_map>
#include <mutex>
#include <queue>
#include <functional>
#include <memory>

static std::unordered_map<std::string, std::string> sessions;
static std::mutex sessions_mutex;

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

//getting last 3 sells
std::string getRecentSellsFromCSV(const std::string& username, const std::string& path = "db/transactions.csv") {
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

        if (user == username && type == "SELL") {
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


//getting last 3 buys
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
        std::cerr << "Failed to initialize Winsock: " << WSAGetLastError() << std::endl;
        return;
    }
#endif

    // Create server socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        std::cerr << "Socket creation failed: " << 
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
        << std::endl;
        return;
    }

    // Set socket option to reuse address
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, 
#ifdef _WIN32
        (const char*)&opt, 
#else
        &opt, 
#endif
        sizeof(opt)) < 0) {
        std::cerr << "setsockopt failed: " << 
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
        << std::endl;
        close(server_fd);
        return;
    }

    // Bind socket
    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        std::cerr << "Bind failed: Port " << port << ", Error: " << 
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
        << std::endl;
        close(server_fd);
        return;
    }

    // Listen
    if (listen(server_fd, SOMAXCONN) < 0) {
        std::cerr << "Listen failed: " << 
#ifdef _WIN32
            WSAGetLastError()
#else
            errno
#endif
        << std::endl;
        close(server_fd);
        return;
    }

    std::cout << "Server listening on port " << port << std::endl;

    // Initialize thread pool and connection manager
    thread_pool = std::make_unique<ThreadPool>(10);  // 10 worker threads
    connection_manager = std::make_unique<ConnectionManager>(100);  // Max 100 concurrent connections

    // Start deadlock monitoring
    monitorDeadlocks();

    // Main accept loop
    while (true) {
        sockaddr_in client_address;
        socklen_t client_address_len = sizeof(client_address);
        
        // Accept a connection
        int client_socket = accept(server_fd, 
            (struct sockaddr*)&client_address, 
            &client_address_len);
        
        if (client_socket < 0) {
            std::cerr << "Accept failed: " << 
#ifdef _WIN32
                WSAGetLastError()
#else
                errno
#endif
            << std::endl;
            continue;
        }

        // Check if we can accept more connections
        if (!connection_manager->acquire_connection()) {
            std::cerr << "Max connections reached. Rejecting client." << std::endl;
            close(client_socket);
            continue;
        }

        // Enqueue client handling task
        thread_pool->enqueue([this, client_socket]() {
            try {
                handleClient(client_socket);
            }
            catch (const std::exception& e) {
                std::cerr << "Error handling client: " << e.what() << std::endl;
            }
            
            // Always release the connection
            connection_manager->release_connection();
            close(client_socket);
        });
    }

    // Cleanup (this part won't be reached due to infinite loop)
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
std::string Server::createHttpResponse(const std::string& content, bool success, const std::string& sessionId) {
    std::stringstream response;
    response << "HTTP/1.1 " << (success ? "200 OK" : "400 Bad Request") << "\r\n";
    response << "Content-Type: text/plain\r\n";
    if (!sessionId.empty()) {
        response << "Set-Cookie: sessionId=" << sessionId << "; HttpOnly\r\n";
    }
    response << "Access-Control-Allow-Origin: http://localhost:8080\r\n";  // Use your client's URL
response << "Access-Control-Allow-Credentials: true\r\n";
    response << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
    response << "Access-Control-Allow-Headers: Content-Type\r\n";
    response << "Content-Length: " << content.length() << "\r\n";
    response << "\r\n"; // End of headers
    response << content;
    
    return response.str();
}



std::string getSessionIdFromRequest(const std::string& request) {
    std::string cookieToken = "Cookie:";
    size_t pos = request.find(cookieToken);
    if (pos != std::string::npos) {
        size_t end = request.find("\r\n", pos);
        std::string cookieLine = request.substr(pos, end - pos);
        size_t sPos = cookieLine.find("sessionId=");
        if (sPos != std::string::npos) {
            sPos += std::string("sessionId=").length();
            size_t semicolon = cookieLine.find(";", sPos);
            if (semicolon == std::string::npos)
                return cookieLine.substr(sPos);
            else
                return cookieLine.substr(sPos, semicolon - sPos);
        }
    }
    return "";
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
    std::istringstream iss(command);
    std::string action, username, password;
    std::getline(iss, action, '|');
    std::getline(iss, username, '|');
    std::getline(iss, password);
    
    if (!username.empty() && !password.empty()) {
        std::string sessionId;  // To hold our generated session ID
        if (loginUser(username, password)) {
            // Generate a simple session ID (for demo purposes only)
            sessionId = "session_" + username + "_" + std::to_string(std::time(nullptr));
            {
                std::lock_guard<std::mutex> lock(sessions_mutex);
                sessions[sessionId] = username;
            }
            // Return the username as part of the response.
            // The response format will be: "OK|Logged in|<username>"
            result = "OK|Logged in|" + username;
            success = true;
            std::string response = createHttpResponse(result, success, sessionId);
            send(clientSocket, response.c_str(), response.size(), 0);
            close(clientSocket);
            return;
        } else {
            result = "ERROR|Invalid credentials";
            success = false;
        }

    } else {
        result = "ERROR|Invalid format";
        success = false;
    }
}

    else if (command.rfind("REGISTER|", 0) == 0) {
        std::istringstream iss(command);
        std::string action, username, password;
        std::getline(iss, action, '|');
        std::getline(iss, username, '|');
        std::getline(iss, password);
    
        if (!username.empty() && !password.empty()) {
            result = registerUser(username, password) ? "OK|User registered" : "ERROR|User exists";
            success = result.substr(0, 2) == "OK";
        } else {
            result = "ERROR|Invalid format";
            success = false;
        }
    }
     else if (command == "GET_MARKET") {
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
    // Get the sessionId from the HTTP headers (from requestData)
    std::string sessionId = getSessionIdFromRequest(requestData);
    std::string sessionUser;
    {
        std::lock_guard<std::mutex> lock(sessions_mutex);
        if (sessions.find(sessionId) != sessions.end()) {
            sessionUser = sessions[sessionId];
        }
    }
    if (!sessionUser.empty()) {
        result = getPortfolio(sessionUser);
        success = true;
    } else {
        result = "ERROR|Not authenticated";
        success = false;
    }
}
 else if (command.rfind("OPTIONS", 0) == 0 || requestData.rfind("OPTIONS", 0) == 0) {
        // Handle preflight CORS requests
        result = "";
        success = true;
    } else if (command.rfind("CSV_BUYS|", 0) == 0) {
        std::string username = command.substr(9);
        result = getLast3BuysFromCSV(username);
        success = true;    
    } else if (command.rfind("RECENT_SELLS|", 0) == 0) {
        std::string username = command.substr(13);
        result = getRecentSellsFromCSV(username);
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