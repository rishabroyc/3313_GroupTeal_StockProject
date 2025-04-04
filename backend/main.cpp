#include "server.h"

int main() {
    Server server(8081);
    server.start();
    return 0;
}