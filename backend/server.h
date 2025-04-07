#ifndef SERVER_H
#define SERVER_H

#include <string>

class Server {
public:
    explicit Server(int port);
    void start();

private:
    int port;
    void handleClient(int clientSocket);
    std::string parseHttpRequest(const std::string& request);
    std::string createHttpResponse(const std::string &content, bool success, const std::string &sessionId = "");
};

#endif
