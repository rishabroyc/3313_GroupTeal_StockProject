#include "server.h"
#include <iostream>
#include <thread>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
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

void Server::handleClient(int clientSocket) {
    char buffer[1024] = {0};
    read(clientSocket, buffer, 1024);
    std::string request(buffer);
    std::string response;

    if (request.rfind("LOGIN|", 0) == 0) {
        std::string username = request.substr(6);
        response = loginUser(username) ? "OK|Login successful" : "ERROR|Invalid user";
    } else if (request.rfind("REGISTER|", 0) == 0) {
        std::string username = request.substr(9);
        response = registerUser(username) ? "OK|User registered" : "ERROR|User exists";
    } else if (request == "GET_MARKET") {
        response = getMarketData();
    } else if (request.rfind("BUY|", 0) == 0) {
        auto parts = request.substr(4);
        auto pos1 = parts.find("|");
        auto pos2 = parts.rfind("|");
        std::string user = parts.substr(0, pos1);
        std::string ticker = parts.substr(pos1+1, pos2-pos1-1);
        int qty = std::stoi(parts.substr(pos2+1));
        response = buyStock(user, ticker, qty) ? "OK|Trade completed" : "ERROR|Buy failed";
    } else if (request.rfind("SELL|", 0) == 0) {
        auto parts = request.substr(5);
        auto pos1 = parts.find("|");
        auto pos2 = parts.rfind("|");
        std::string user = parts.substr(0, pos1);
        std::string ticker = parts.substr(pos1+1, pos2-pos1-1);
        int qty = std::stoi(parts.substr(pos2+1));
        response = sellStock(user, ticker, qty) ? "OK|Trade completed" : "ERROR|Sell failed";
    } else if (request.rfind("PORTFOLIO|", 0) == 0) {
        std::string username = request.substr(10);
        response = getPortfolio(username);
    } else {
        response = "ERROR|Unknown command";
    }

    send(clientSocket, response.c_str(), response.size(), 0);
    close(clientSocket);
}
