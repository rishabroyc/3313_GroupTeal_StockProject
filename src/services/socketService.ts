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
    const authToken = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8081`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      credentials: 'include',
      body: command,
    });
    
    

    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.text();
    console.log(`Server response for command ${command}:`, data);
    return data;
  } catch (error) {
    console.error('Error communicating with backend server:', error);
    throw error;
  }
};

/**
 * Parses a response from the server - handles both formatted protocol responses and direct JSON
 */
export const parseResponse = (response: string): { status: 'OK' | 'ERROR', message: string, data?: any } => {
  // First try to parse as JSON (for endpoints that return JSON directly)
  try {
    if (response.startsWith('{') || response.startsWith('[')) {
      const jsonData = JSON.parse(response);
      return {
        status: 'OK',
        message: 'Data received',
        data: jsonData
      };
    }
  } catch (e) {
    // Not valid JSON, proceed with protocol parsing
    console.log("Response is not valid JSON, trying protocol parsing");
  }

  // Handle protocol-formatted responses
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
    const dataString = response.substring(5);
    
    // Try to parse as JSON if it looks like JSON
    try {
      if (dataString.startsWith('{') || dataString.startsWith('[')) {
        return {
          status: 'OK',
          message: 'Data received',
          data: JSON.parse(dataString)
        };
      }
    } catch (e) {
      // Not JSON, return as string
      console.warn("DATA| prefix content is not valid JSON:", e);
    }
    
    return {
      status: 'OK',
      message: 'Data received',
      data: dataString
    };
  } else {
    // If we can't recognize the format but it might be data without prefix
    return {
      status: 'ERROR',
      message: 'Unknown response format',
      data: response  // Include the raw response in case it needs to be processed
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
    
    // Check if the response is already parsed JSON
    if (result.status === 'OK' && result.data && typeof result.data === 'object') {
      // If it's an array, assume it's directly the stocks array
      if (Array.isArray(result.data)) {
        return {
          success: true,
          stocks: result.data,
          message: 'Market data retrieved successfully'
        };
      } 
      // If it has a stocks property, use that
      else if (result.data.stocks) {
        return {
          success: true,
          stocks: result.data.stocks,
          message: 'Market data retrieved successfully'
        };
      }
    }
    
    // Otherwise try to parse as semicolon-separated values
    if (result.status === 'OK' && result.data && typeof result.data === 'string') {
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
        message: result.message || 'Failed to parse market data'
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
    console.log(`Fetching portfolio for ${username}`);
    const response = await sendCommand(`PORTFOLIO|${username}`);
    console.log('Raw portfolio response:', response);
    
    // First try to parse as direct JSON
    try {
      if (response.startsWith('[') || response.startsWith('{')) {
        const jsonResponse = JSON.parse(response);
        
        // If it's an array, assume it's the holdings directly
        if (Array.isArray(jsonResponse)) {
          return {
            success: true,
            holdings: jsonResponse,
            message: 'Portfolio retrieved successfully'
          };
        }
        
        // If it has a holdings property, use that
        if (jsonResponse.holdings) {
          return {
            success: true,
            holdings: jsonResponse.holdings,
            message: 'Portfolio retrieved successfully'
          };
        }
      }
    } catch (e) {
      console.log('Not direct JSON, trying standard parsing');
    }
    
    const result = parseResponse(response);
    console.log('Parsed portfolio response:', result);
    
    // Check if we have structured data from parseResponse
    if (result.status === 'OK' && result.data) {
      // If data is already an object/array from JSON parsing
      if (typeof result.data === 'object') {
        // Direct array
        if (Array.isArray(result.data)) {
          return {
            success: true,
            holdings: result.data,
            message: 'Portfolio retrieved successfully'
          };
        }
        // Object with holdings property
        else if (result.data.holdings) {
          return {
            success: true,
            holdings: result.data.holdings,
            message: 'Portfolio retrieved successfully'
          };
        }
      }
      
      // Otherwise assume it's a string format
      if (typeof result.data === 'string') {
        // This section needs to be updated to handle the specific format
        // DATA|AAPL,4;GOOGL,1;
        const holdingsString = result.data;
        const holdings = [];
        
        // Split by semicolon to get each holding
        const holdingPairs = holdingsString.split(';').filter(item => item.trim() !== '');
        
        for (const pair of holdingPairs) {
          // Split by comma to get ticker and quantity
          const [ticker, quantityStr] = pair.split(',');
          if (ticker && quantityStr) {
            holdings.push({
              ticker,
              quantity: parseInt(quantityStr, 10)
            });
          }
        }
        
        return {
          success: true,
          holdings,
          message: 'Portfolio retrieved successfully'
        };
      }
    }
    
    // If we get here, something went wrong with parsing
    return {
      success: false,
      holdings: [], // Provide an empty array to prevent errors
      message: result.message || 'Failed to parse portfolio data'
    };
  } catch (error) {
    console.error('Error in getPortfolio:', error);
    return {
      success: false,
      holdings: [], // Provide an empty array to prevent errors
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

/**
 * Get recent buy transactions
 * @param username The username to get transaction history for
 * @returns Promise resolving to transaction data
 */
export const getRecentTransactions = async (username: string): Promise<{ success: boolean, data?: any[], message?: string }> => {
  try {
    const response = await sendCommand(`CSV_BUYS|${username}`);
    
    // First try direct JSON parsing
    try {
      if (response.startsWith('[')) {
        const jsonData = JSON.parse(response);
        return { 
          success: true, 
          data: jsonData 
        };
      }
    } catch (e) {
      console.log('Transaction response is not direct JSON, trying standard parsing');
    }
    
    // Fall back to response parsing
    const result = parseResponse(response);
    
    if (result.status === 'OK' && result.data) {
      // Already parsed as JSON in parseResponse
      if (Array.isArray(result.data)) {
        return { 
          success: true, 
          data: result.data 
        };
      }
      
      // Try to parse as JSON if it's a string
      if (typeof result.data === 'string') {
        try {
          const jsonData = JSON.parse(result.data);
          return { 
            success: true, 
            data: jsonData 
          };
        } catch (e) {
          console.error("Error parsing transaction data as JSON:", e);
        }
      }
    }
    
    // If we get here, we failed to parse properly
    return { 
      success: false, 
      data: [],
      message: result.message || 'Failed to parse transaction data' 
    };
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return { 
      success: false, 
      data: [],
      message: error instanceof Error ? error.message : 'Network error' 
    };
  }
};

/**
 * Get recent sell transactions
 * @param username The username to get sell history for
 * @returns Promise resolving to sell transaction data
 */
export const getRecentSells = async (username: string): Promise<{ success: boolean, data?: any[], message?: string }> => {
  try {
    const response = await sendCommand(`RECENT_SELLS|${username}`);
    
    // First try direct JSON parsing
    try {
      if (response.startsWith('[')) {
        const jsonData = JSON.parse(response);
        return { 
          success: true, 
          data: jsonData 
        };
      }
    } catch (e) {
      console.log('Sell response is not direct JSON, trying standard parsing');
    }
    
    // Fall back to response parsing
    const result = parseResponse(response);
    
    if (result.status === 'OK' && result.data) {
      // Already parsed as JSON in parseResponse
      if (Array.isArray(result.data)) {
        return { 
          success: true, 
          data: result.data 
        };
      }
      
      // Try to parse as JSON if it's a string
      if (typeof result.data === 'string') {
        try {
          const jsonData = JSON.parse(result.data);
          return { 
            success: true, 
            data: jsonData 
          };
        } catch (e) {
          console.error("Error parsing sell data as JSON:", e);
        }
      }
    }
    
    // If we get here, we failed to parse properly
    return { 
      success: false, 
      data: [],
      message: result.message || 'Failed to parse sell data' 
    };
  } catch (error) {
    console.error("Error fetching recent sells:", error);
    return { 
      success: false, 
      data: [],
      message: error instanceof Error ? error.message : 'Network error' 
    };
  }
};