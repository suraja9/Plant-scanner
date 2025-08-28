import React, { useState } from "react";
import ImageUpload from "./components/ImageUpload";
import { identifyPlant } from "./api";
import "../src/App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDetect = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPlantData(null);

    try {
      // Remove base64 prefix before sending to API
      const base64Data = selectedImage.replace(/^data:image\/\w+;base64,/, "");
      
      console.log("Sending base64 data length:", base64Data.length);
      
      const result = await identifyPlant(base64Data);

      console.log("API Result:", result);

      // Handle the response structure based on Plant.id v3 API
      if (result && result.result) {
        // Check if it's a plant first
        const isPlant = result.result.is_plant?.binary;
        
        if (isPlant === false) {
          setError("This doesn't appear to be a plant. Please upload a clear image of a plant.");
          return;
        }

        // Get plant classification suggestions
        if (result.result.classification && result.result.classification.suggestions) {
          const suggestions = result.result.classification.suggestions;
          
          if (suggestions.length > 0) {
            const best = suggestions[0];
            setPlantData({
              name: best.name,
              probability: (best.probability * 100).toFixed(2) + "%",
              commonNames: best.details?.common_names || [],
              wikiUrl: best.details?.url || "",
            });
          } else {
            setError("No plant suggestions found. Try uploading a clearer image of the plant.");
          }
        } else {
          console.log("Unexpected API response structure:", result);
          setError("Unable to classify the plant. Please try a different image.");
        }
      } else {
        console.log("Invalid API response:", result);
        setError("Invalid response from plant identification service.");
      }
    } catch (err) {
      console.error("Plant identification error:", err);
      setError(err.message || "Error identifying plant. Please try again.");
    }

    setLoading(false);
  };

  const handleImageClear = () => {
    setSelectedImage(null);
    setPlantData(null);
    setError("");
  };

  return (
    <div className="app">
      <h1>🌱 Plant Scanner</h1>
      <p>Upload a photo to identify your plant</p>

      <ImageUpload onImageSelect={setSelectedImage} />

      {selectedImage && (
        <div style={{ margin: "10px 0" }}>
          <button
            className="detect-butn"
            onClick={handleDetect}
            disabled={loading}
            style={{ 
              marginRight: "10px",
              backgroundColor: loading ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Detecting..." : "Detect Plant"}
          </button>
          <button
            onClick={handleImageClear}
            disabled={loading}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          color: "red", 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          border: "1px solid #ffcdd2", 
          borderRadius: "5px", 
          margin: "10px 0" 
        }}>
          {error}
        </div>
      )}

      {plantData && (
        <div className="result-card" style={{
          backgroundColor: "#e8f5e8",
          border: "1px solid #4CAF50",
          borderRadius: "10px",
          padding: "20px",
          margin: "20px 0"
        }}>
          <h2 style={{ color: "#2e7d32", margin: "0 0 10px 0" }}>
            {plantData.name}
          </h2>
          <p><strong>Confidence:</strong> {plantData.probability}</p>
          {plantData.commonNames.length > 0 && (
            <p><strong>Also known as:</strong> {plantData.commonNames.join(", ")}</p>
          )}
          {plantData.wikiUrl && (
            <a 
              href={plantData.wikiUrl} 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                color: "#1976d2", 
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              📖 Learn more
            </a>
          )}
        </div>
      )}

      {loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "20px",
          fontSize: "16px",
          color: "#666"
        }}>
          🔍 Analyzing your plant image...
        </div>
      )}
    </div>
  );
}

export default App;