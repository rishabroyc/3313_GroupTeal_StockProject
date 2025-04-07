#ifndef SERVER_H
#define SERVER_H

#include <string>
#include <memory>
#include <iostream>
#include <thread>
#include <chrono>
#include "concurrency_managers.h"

class Server {
public:
    explicit Server(int port);
    void start();
    void stop();

private:
    int port;
    int server_fd = -1;  // Track server socket
    
    // Smart pointers for thread pool and connection manager
    std::unique_ptr<ThreadPool> thread_pool;
    std::unique_ptr<ConnectionManager> connection_manager;

    // Existing methods
    void handleClient(int clientSocket);
    std::string parseHttpRequest(const std::string& request);
    std::string createHttpResponse(const std::string &content, bool success, const std::string &sessionId = "");

    // Deadlock monitoring method
    void monitorDeadlocks() {
        std::thread monitor([this] {
            while (true) {
                std::this_thread::sleep_for(std::chrono::minutes(5));
                std::cout << "Performing deadlock check..." << std::endl;
            }
        });
        monitor.detach();
    }
};

#endif // SERVER_H