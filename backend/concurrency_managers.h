#ifndef CONCURRENCY_MANAGERS_H
#define CONCURRENCY_MANAGERS_H

#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <vector>
#include <functional>
#include <atomic>
#include <memory>
#include <stdexcept>
#include <chrono>

class ThreadPool {
public:
    explicit ThreadPool(size_t threads = std::thread::hardware_concurrency()) {
        for(size_t i = 0; i < threads; ++i) {
            workers.emplace_back([this] {
                while(true) {
                    std::function<void()> task;
                    {
                        std::unique_lock<std::mutex> lock(this->queue_mutex);
                        
                        // Wait for tasks or stop signal
                        this->condition.wait(lock, [this] {
                            return this->stop_flag || !this->tasks.empty();
                        });

                        // Exit if stopped and no tasks
                        if(this->stop_flag && this->tasks.empty()) {
                            return;
                        }

                        // Get the task
                        task = std::move(this->tasks.front());
                        this->tasks.pop();
                    }

                    // Execute the task
                    task();
                }
            });
        }
    }

    ~ThreadPool() {
        stop();
    }

    void enqueue(std::function<void()> task) {
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            if(stop_flag) {
                throw std::runtime_error("Enqueue on stopped ThreadPool");
            }
            tasks.emplace(std::move(task));
        }
        condition.notify_one();
    }

    void stop() {
        {
            std::unique_lock<std::mutex> lock(queue_mutex);
            stop_flag = true;
        }
        condition.notify_all();

        // Wait for all threads to finish
        for(auto& worker : workers) {
            if(worker.joinable()) {
                worker.join();
            }
        }
    }

private:
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex queue_mutex;
    std::condition_variable condition;
    std::atomic<bool> stop_flag{false};
};

class ConnectionManager {
public:
    explicit ConnectionManager(int max_connections = 100) 
        : max_connections(max_connections) {}
    
    bool acquire_connection() {
        std::unique_lock<std::mutex> lock(connection_mutex);
        
        // Wait if max connections reached
        bool acquired = connection_cv.wait_for(lock, 
            std::chrono::seconds(10), 
            [this] { 
                return current_connections < max_connections; 
            }
        );

        if(acquired) {
            ++current_connections;
            return true;
        }
        
        return false;
    }

    void release_connection() {
        {
            std::unique_lock<std::mutex> lock(connection_mutex);
            --current_connections;
        }
        connection_cv.notify_one();
    }

private:
    const int max_connections;
    std::atomic<int> current_connections{0};
    std::mutex connection_mutex;
    std::condition_variable connection_cv;
};

#endif // CONCURRENCY_MANAGERS_H