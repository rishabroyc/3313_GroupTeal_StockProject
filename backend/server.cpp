#include "server.h"
#include <iostream>
#include <thread>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include <sstream>
#include "handlers/auth.h"
#include "handlers/market.h"
#include "handlers/trade.h"
#include "handlers/portfolio.h"

Server::Server(int port) : port(port) {}

void Server::start() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 5);

    std::cout << "Server listening on port " << port << std::endl;

    while (true) {
        int client_socket = accept(server_fd, nullptr, nullptr);
        std::thread(&Server::handleClient, this, client_socket).detach();
    }
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