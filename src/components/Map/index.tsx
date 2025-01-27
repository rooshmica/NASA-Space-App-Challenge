"use client";
import { useEffect, useState } from "react";
import { ImageOverlay, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const Map = () => {
  const [northErrorMargin, setNorthErrorMargin] = useState<number>(20);
  const [southErrorMargin, setSouthErrorMargin] = useState<number>(20);
  const [eastErrorMargin, setEastErrorMargin] = useState<number>(0);
  const [westErrorMargin, setWestErrorMargin] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [date, setDate] = useState<string | null>("20240925");
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the processed image from the backend
  const fetchProcessedImage = async (dateStr: string) => {
    setLoading(true); // Start loading
    setError(null); // Reset error state
    const response = await fetch(`http://localhost:8080/chlor_a_plot_img/?date_str=${dateStr}&localpath=./&force_download=false`);

    if (!response.ok) {
      console.error("Error fetching the image:", response.statusText);
      setError("Failed to fetch the image."); // Update error state
      setLoading(false); // Stop loading
      return null;
    }

    const blob = await response.blob();
    setLoading(false); // Stop loading
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    const dateStr = date ?? "20230925"; // Default date if null

    // Call the backend to get the processed image
    fetchProcessedImage(dateStr).then((newImageUrl) => {
      if (newImageUrl) {
        setProcessedImageSrc(newImageUrl);
      }
    });

    // Cleanup function to revoke the object URL when the component unmounts
    return () => {
      if (processedImageSrc) {
        URL.revokeObjectURL(processedImageSrc);
      }
    };
  }, [date]);

  // Functions to adjust error margins
  const increaseNorthErrorMargin = () => setNorthErrorMargin(northErrorMargin + 1);
  const decreaseNorthErrorMargin = () => setNorthErrorMargin(northErrorMargin - 1); // Prevent negative margin
  const increaseSouthErrorMargin = () => setSouthErrorMargin(southErrorMargin + 1);
  const decreaseSouthErrorMargin = () => setSouthErrorMargin(southErrorMargin - 1); // Prevent negative margin
  const increaseEastErrorMargin = () => setEastErrorMargin(eastErrorMargin + 1);
  const decreaseEastErrorMargin = () => setEastErrorMargin(eastErrorMargin - 1); // Prevent negative margin
  const increaseWestErrorMargin = () => setWestErrorMargin(westErrorMargin + 1);
  const decreaseWestErrorMargin = () => setWestErrorMargin(westErrorMargin - 1); // Prevent negative margin

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value.replace(/-/g, ""); // Convert date to YYYYMMDD format
    setDate(selectedDate);
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={3}
        scrollWheelZoom={true}
        minZoom={3}
        maxBounds={[
          [7, 12],
          [-5, -15],
        ]}
        maxBoundsViscosity={1}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          bounds={[
            [-90, -180],
            [90, 180],
          ]}
          minZoom={1}
          opacity={0.75}
        />

        {loading && <div>Loading image...</div>} {/* Show loading state */}
        {error && <div style={{ color: 'red' }}>{error}</div>} {/* Show error message */}

        {processedImageSrc && (
          <ImageOverlay
            url={"https://oceancolor.gsfc.nasa.gov/showimages/MODISA/IMAGES/PIC/L3/2024/0501/AQUA_MODIS.20240501.L3m.DAY.PIC.pic.4km.nc.png"}
            bounds={[
              [90 - northErrorMargin, 180 + eastErrorMargin], // Top Right
              [-90 + southErrorMargin, -180 - westErrorMargin], // Bottom Left
            ]}
            opacity={0.5}
          />
        )}
      </MapContainer>
      {/* Control buttons for adjusting error margins */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}>
        {northErrorMargin} {southErrorMargin} {eastErrorMargin} {westErrorMargin}
        <h4>Adjust Error Margins:</h4>
        {/* North Margin Controls */}
        <div>
          <button className="bg-black text-white" onClick={increaseNorthErrorMargin}>Increase North Error</button>
          <button className="bg-black text-white" onClick={decreaseNorthErrorMargin}>Decrease North Error</button>
        </div>

        {/* South Margin Controls */}
        <div>
          <button className="bg-black text-white" onClick={increaseSouthErrorMargin}>Increase South Error</button>
          <button className="bg-black text-white" onClick={decreaseSouthErrorMargin}>Decrease South Error</button>
        </div>

        {/* East Margin Controls */}
        <div>
          <button className="bg-black text-white" onClick={increaseEastErrorMargin}>Increase East Error</button>
          <button className="bg-black text-white" onClick={decreaseEastErrorMargin}>Decrease East Error</button>
        </div>

        {/* West Margin Controls */}
        <div>
          <button className="bg-black text-white" onClick={increaseWestErrorMargin}>Increase West Error</button>
          <button className="bg-black text-white" onClick={decreaseWestErrorMargin}>Decrease West Error</button>
        </div>
      </div>

      {/* Date Picker */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "5px",
      }}>
        <label htmlFor="datePicker" style={{ fontWeight: 'bold' }}>Select Date:</label>
        <input
          id="datePicker"
          type="date"
          onChange={handleDateChange}
          defaultValue={date?.substring(0, 8)} // Format date to YYYY-MM-DD
          className="z-10"
        />
      </div>
    </div>
  );
};

