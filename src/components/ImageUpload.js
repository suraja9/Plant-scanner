import React, { useState } from "react";


const ImageUpload = ({ onImageSelect }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="upload-section">
      <input style={{}} type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div className="preview">
          <img src={preview} style={{margin:"40px 0px 0px",borderRadius:"10px"}} alt="Preview" width="400" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
