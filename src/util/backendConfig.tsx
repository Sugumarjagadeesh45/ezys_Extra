
// export const LOCAL_IP = "192.168.1.108";

// // Your Render / Production backend URL
// export const API_BASE_URL = "https://bba-a8lu.onrender.com";

// // ----------- MAIN URL FUNCTIONS -------------- //

// export const getBackendUrl = (): string => {
//   return process.env.NODE_ENV === "production" 
//     ? API_BASE_URL 
//     : `http://${LOCAL_IP}:5001`;
// };

// export const getSocketUrl = (): string => {
//   return getBackendUrl();
// };

// // ----------- IMAGE URL HANDLERS -------------- //

// // Main image URL handler
// export const getImageUrl = (imagePath: string): string => {
//   if (!imagePath) return "";

//   const backendUrl = getBackendUrl();

//   // If it's already a complete URL
//   if (imagePath.startsWith("http")) {
//     // Replace localhost/127.0.0.1 with actual backend URL
//     if (imagePath.includes('localhost:5001') || imagePath.includes('127.0.0.1:5001')) {
//       return imagePath.replace(/http:\/\/[^/]+/, backendUrl);
//     }
//     return imagePath;
//   }

//   // Handle different path formats
//   if (imagePath.startsWith("/uploads/")) {
//     return `${backendUrl}${imagePath}`;
//   }

//   if (imagePath.startsWith("uploads/")) {
//     return `${backendUrl}/${imagePath}`;
//   }

//   // Default case
//   return `${backendUrl}/uploads/${imagePath}`;
// };

// // Add this missing function that your components need
// export const getProductImageUrl = (imagePath: string): string => {
//   return getImageUrl(imagePath);
// };

// // ----------- ENV BASED API CONFIG -------------- //

// export const API_CONFIG = {
//   BASE_URL: getBackendUrl(),

//   getImageUrl: (path: string) => getImageUrl(path),
  
//   getProductImageUrl: (path: string) => getProductImageUrl(path),
// };

// // ----------- DEFAULT EXPORT -------------- //

// export default {
//   getBackendUrl,
//   getSocketUrl,
//   getImageUrl,
//   getProductImageUrl,
//   API_CONFIG,
//   LOCAL_IP,
//   API_BASE_URL,
// };

// Your Render / Production backend URL
export const API_BASE_URL = "https://backendddd-2xa6.onrender.com";

// ----------- MAIN URL FUNCTIONS -------------- //

export const getBackendUrl = (): string => {
  return API_BASE_URL; // Always use production URL
};

export const getSocketUrl = (): string => {
  return getBackendUrl();
};

// ----------- IMAGE URL HANDLERS -------------- //

// Main image URL handler
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  const backendUrl = getBackendUrl();

  // If it's already a complete URL
  if (imagePath.startsWith("http")) {
    // Replace any localhost/127.0.0.1 with production backend URL
    if (imagePath.includes('localhost') || imagePath.includes('127.0.0.1')) {
      return imagePath.replace(/http:\/\/[^/]+/, backendUrl);
    }
    return imagePath;
  }

  // Handle different path formats
  if (imagePath.startsWith("/uploads/")) {
    return `${backendUrl}${imagePath}`;
  }

  if (imagePath.startsWith("uploads/")) {
    return `${backendUrl}/${imagePath}`;
  }

  // Default case
  return `${backendUrl}/uploads/${imagePath}`;
};

// Add this missing function that your components need
export const getProductImageUrl = (imagePath: string): string => {
  return getImageUrl(imagePath);
};

// ----------- ENV BASED API CONFIG -------------- //

export const API_CONFIG = {
  BASE_URL: getBackendUrl(),

  getImageUrl: (path: string) => getImageUrl(path),
  
  getProductImageUrl: (path: string) => getProductImageUrl(path),
};

// ----------- DEFAULT EXPORT -------------- //

export default {
  getBackendUrl,
  getSocketUrl,
  getImageUrl,
  getProductImageUrl,
  API_CONFIG,
  API_BASE_URL,
};









// // /Users/webasebrandings/Downloads/new_far-main 2/src/util/backendConfig.tsx
// import axios from 'axios';

// // LOCAL + SOCKET URL = NGROK URL
// const NGROK_URL = "https://701dcc86fbd5.ngrok-free.app";

// // USE LOCALHOST MODE
// const useLocalhost = false;

// // Backend URL
// const API_BASE_URL = useLocalhost ? NGROK_URL : "https://bba-a8lu.onrender.com";

// // Test backend
// export const testBackendConnection = async () => {
//   try {
//     console.log("Testing:", API_BASE_URL);
//     const r = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
//     console.log("Connected:", r.data);
//     return true;
//   } catch (e) {
//     console.error("Failed:", e);
//     return false;
//   }
// };

// export const getBackendUrl = () => API_BASE_URL;

// // New function to get correct image URL
// export const getImageUrl = (imagePath: string) => {
//   if (!imagePath) return 'https://via.placeholder.com/150';
  
//   // If image path already includes the full URL, return it as is
//   if (imagePath.startsWith('http')) {
//     return imagePath;
//   }
  
//   // If image path starts with /uploads/, prepend the base URL
//   if (imagePath.startsWith('/uploads/')) {
//     return `${API_BASE_URL}${imagePath}`;
//   }
  
//   // Otherwise, assume it's a relative path and prepend the base URL with /uploads/
//   return `${API_BASE_URL}/uploads/${imagePath}`;
// };

// export const getEnvironmentInfo = () => ({
//   isLocalhost: useLocalhost,
//   currentBackend: API_BASE_URL,
// });


// //Users/webasebrandings/Downloads/new_far-main 2/src/util/backendConfig.js














