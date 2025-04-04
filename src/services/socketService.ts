/**
 * Service for communicating with the C++ backend server
 */

// The backend server address and port
const SERVER_URL = 'localhost';
const SERVER_PORT = 8081;  // Make sure this matches your C++ server port

/**
 * Sends a command to the backend server and returns the response
 * @param command The command to send to the server
 * @returns Promise that resolves with the server response
 */
export const sendCommand = async (command: string): Promise<string> => {
  try {
    // Using fetch API to communicate with the backend
    const response = await fetch(`http://${SERVER_URL}:${SERVER_PORT}`, {
      method: 'POST',
      body: command,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error communicating with backend server:', error);
    throw error;
  }
};

/**
 * Parses a response from the server
 * @param response The response from the server
 * @returns Object containing status and data
 */
export const parseResponse = (response: string): { status: 'OK' | 'ERROR', message: string, data?: string } => {
  if (response.startsWith('OK|')) {
    return {
      status: 'OK',
      message: response.substring(3)
    };
  } else if (response.startsWith('ERROR|')) {
    return {
      status: 'ERROR',
      message: response.substring(6)
    };
  } else if (response.startsWith('DATA|')) {
    return {
      status: 'OK',
      message: 'Data received',
      data: response.substring(5)
    };
  } else {
    return {
      status: 'ERROR',
      message: 'Unknown response format'
    };
  }
};

/**
 * Authentication service
 */

/**
 * Register a new user
 * @param username The username to register
 * @param password The password for the new user
 * @returns Promise resolving to registration result
 */
export const registerUser = async (username: string, password: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await sendCommand(`REGISTER|${username}|${password}`);
    const result = parseResponse(response);
    
    return {
      success: result.status === 'OK',
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to register user'
    };
  }
};

/**
 * Login with an existing user
 * @param username The username to login with
 * @param password The password for authentication
 * @returns Promise resolving to login result
 */
export const loginUser = async (username: string, password: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await sendCommand(`LOGIN|${username}|${password}`);
    const result = parseResponse(response);
    
    return {
      success: result.status === 'OK',
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to login'
    };
  }
};

/**
 * Get market data
 * @returns Promise resolving to market data
 */
export const getMarketData = async (): Promise<{ success: boolean, stocks?: Array<{ ticker: string, name: string, price: number }>, message: string }> => {
  try {
    const response = await sendCommand('GET_MARKET');
    const result = parseResponse(response);
    
    if (result.status === 'OK' && result.data) {
      // Parse the market data
      const stocksData = result.data.split(';').filter(item => item.trim() !== '');
      const stocks = stocksData.map(stockItem => {
        const [ticker, name, price] = stockItem.split(',');
        return {
          ticker,
          name,
          price: parseFloat(price)
        };
      });
      
      return {
        success: true,
        stocks,
        message: 'Market data retrieved successfully'
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get market data'
    };
  }
};

/**
 * Get user portfolio
 * @param username The username to get portfolio for
 * @returns Promise resolving to portfolio data
 */
export const getPortfolio = async (username: string): Promise<{ success: boolean, holdings?: Array<{ ticker: string, quantity: number }>, message: string }> => {
  try {
    const response = await sendCommand(`PORTFOLIO|${username}`);
    const result = parseResponse(response);
    
    if (result.status === 'OK' && result.data) {
      // Parse the portfolio data
      const holdingsData = result.data.split(';').filter(item => item.trim() !== '');
      const holdings = holdingsData.map(holdingItem => {
        const [ticker, quantity] = holdingItem.split(',');
        return {
          ticker,
          quantity: parseInt(quantity)
        };
      });
      
      return {
        success: true,
        holdings,
        message: 'Portfolio retrieved successfully'
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get portfolio'
    };
  }
};

/**
 * Buy stock
 * @param username The username of the buyer
 * @param ticker The stock ticker to buy
 * @param quantity The quantity to buy
 * @returns Promise resolving to transaction result
 */
export const buyStock = async (username: string, ticker: string, quantity: number): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await sendCommand(`BUY|${username}|${ticker}|${quantity}`);
    const result = parseResponse(response);
    
    return {
      success: result.status === 'OK',
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to buy stock'
    };
  }
};

/**
 * Sell stock
 * @param username The username of the seller
 * @param ticker The stock ticker to sell
 * @param quantity The quantity to sell
 * @returns Promise resolving to transaction result
 */
export const sellStock = async (username: string, ticker: string, quantity: number): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await sendCommand(`SELL|${username}|${ticker}|${quantity}`);
    const result = parseResponse(response);
    
    return {
      success: result.status === 'OK',
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to sell stock'
    };
  }
};