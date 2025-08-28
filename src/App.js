import React, {useState} from "react";
import UploadedImage from "./components/ImageUpload";
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
      const base64Data = selectedImage.replace(/^data:image\/\w+;base64,/, "");
      
      console.log("Sending base64 data length:", base64Data.length);
      
      const result = await identifyPlant(base64Data);

      console.log("API Result:", result);

      if (result && result.result) {
        const isPlant = result.result.is_plant?.binary;
        
        if (isPlant === false) {
          setError("This is not a plant");
          return;
        }

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
            setError("Can't match with any plants.Upload another plant image");
          }
        } else {
          console.log("Unexpected API response:", result);
          setError("Unable to identify the plan.Please use another image");
        }
      } else {
        console.log("Invalid API response:", result);
        setError("Invalid response from plant identification service.");
      }
    } catch (err) {
      console.error("Plant identification error:", err);
      setError(err.message || "Error identifying the plant. Please try again.");
    }

    setLoading(false);
  };

  const handleImageClear = () => {
    setSelectedImage(null);
    setPlantData(null);
    setError("");
  };

  return (
    <div className="Main-section">
      <h1>PLANT SCANNER</h1>
      <p>Identify plants instantly with just an Image </p>

      <UploadedImage onImageSelect={setSelectedImage} />

      {selectedImage && (
        <div>
          <button
            className="det-ect-butn"
            onClick={handleDetect}
            disabled={loading}
          >
            {loading ? "Detecting..." : "Detect Plant"}
          </button>
          <button
            onClick={handleImageClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <div>
          {error}
        </div>
      )}

      {plantData && (
        <div className="result-card">
          <h2>
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
            >
              📖 Learn more
            </a>
          )}
        </div>
      )}

      {loading && (
        <div> Analyzing your plant image, Please wait ...
        </div>
      )}
    </div>
  );
}

export default App;