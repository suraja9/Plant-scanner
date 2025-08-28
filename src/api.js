const API_KEY = process.env.REACT_APP_PLANT_API_KEY;
const API_URL = "https://api.plant.id/v3/identification";

export async function identifyPlant(base64Image) {
  // Check if API key exists
  if (!API_KEY) {
    throw new Error("API key is missing. Please set REACT_APP_PLANT_API_KEY in your .env file");
  }

  try {
    console.log("Making API request to:", API_URL);
    console.log("API Key exists:", !!API_KEY);
    
    // Based on the official Plant.id examples, the correct format is:
    // - images in JSON body
    // - details as URL parameters
    // - API key in headers
    const requestBody = {
      images: [base64Image]
    };

    // Add details as URL parameters
    const urlWithParams = `${API_URL}?details=url,common_names`;

    console.log("Request URL:", urlWithParams);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(urlWithParams, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your Plant.id API key.");
      } else if (response.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      } else if (response.status === 400) {
        throw new Error(`Bad request: ${errorText}`);
      } else {
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error identifying plant:", error);
    throw error;
  }
}