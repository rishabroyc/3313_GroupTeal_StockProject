#ifndef SERVER_H
#define SERVER_H

class Server {
public:
    Server(int port);
    void start();

private:
    int port;
    void handleClient(int clientSocket);
};

#endif
