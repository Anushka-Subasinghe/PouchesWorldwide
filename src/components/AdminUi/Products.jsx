"use client";
import React, { useState, useEffect } from "react";
import { CircleX } from "lucide-react";

const Products = ({ product, userId }) => {
  const { id, Name, Image, Selector, documentId } = product;

  // Generate the image URL
  const imageUrl = Image?.formats?.medium?.url || Image?.url || "/4.png";
  const fullImageUrl = `https://pouchesworldwide.com/strapi${imageUrl}`;

  // Convert userId to number
  const manualUserId = +userId;

  // Local state for price ranges specific to the current user.
  // We will load from product.custom_price_ranges[manualUserId] if available,
  // otherwise fallback to product.price_ranges.
  const [priceRanges, setPriceRanges] = useState([]);
  
  // Input states for adding a new custom price range entry.
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // On product load, initialize priceRanges.
  useEffect(() => {
    if (product) {
      // custom_price_ranges is expected to be a JSON object with keys as user IDs.
      if (product.custom_price_ranges && product.custom_price_ranges[manualUserId]) {
        setPriceRanges(product.custom_price_ranges[manualUserId]);
      } else if (product.price_ranges && product.price_ranges.length > 0) {
        setPriceRanges(product.price_ranges);
      } else {
        setPriceRanges([]);
      }
    }
  }, [product, manualUserId]);

  // Add a new price range entry.
  const addPriceRangeEntry = () => {
    if (customMin && customMax && customPrice) {
      setPriceRanges([
        ...priceRanges,
        {
          min: Number(customMin),
          max: Number(customMax),
          price: parseFloat(customPrice)
        }
      ]);
      setCustomMin("");
      setCustomMax("");
      setCustomPrice("");
    }
  };

  // Remove a price range entry by index.
  const removePriceRangeEntry = (index) => {
    const updated = [...priceRanges];
    updated.splice(index, 1);
    setPriceRanges(updated);
  };

  // Save the updated custom price ranges in the product document.
  // The custom_price_ranges field will be a JSON with keys as user IDs.
  const savePriceRanges = async () => {
    try {
      // Merge with any existing custom_price_ranges object.
      const existingCustom = product.custom_price_ranges || {};
      const updatedCustomPriceRanges = {
        ...existingCustom,
        [manualUserId]: priceRanges.map((range) => ({
          min: Number(range.min),
          max: Number(range.max),
          price: Number(range.price)
        }))
      };

      const payload = {
        data: {
          custom_price_ranges: updatedCustomPriceRanges
        }
      };

      const response = await fetch(
        `https://pouchesworldwide.com/strapi/api/products/${documentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer 5052969b56473855941566f1676c3741c7b9698aca9ebd14df17d9cc2f9e81df39925d986c857bdec7fc3c32ae46dea1469eae3b4d34908c3420cc93f8e2401a2bad1c4cde33a2c1b8209956f1ad2d7b4119474aab82d8434a43927f571688a7808b64be699e37a49cc87054df0657b8cad25fbcc8d6ff7048ae4f2304a55c99` },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error("Failed to save custom price ranges");

      alert("Custom price ranges saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving custom price ranges:", error);
    }
  };

  return (
    <div className="card w-[333px] bg-neutral shadow-xl relative flex flex-col cursor-pointer">
      <figure className="px-8 pt-6">
        {imageUrl && (
          <img
            src={fullImageUrl}
            alt={Name}
            width={200}
            height={200}
            className="rounded-lg"
          />
        )}
      </figure>
      <div className="card-body p-6 flex flex-col flex-grow">
        <h2 className="text-center font-semibold text-primary text-[22px] font-poppins">
          {Name}
        </h2>

        {/* Display the current custom price ranges */}
        <div className="item-center justify-center rounded-lg">
          {priceRanges && priceRanges.length > 0 ? (
            priceRanges.map((range, index) => (
              <div
                key={index}
                className="flex justify-between items-center border border-[#adb5bd] p-2 rounded-lg w-[291.52px] h-[79.38px] mb-2"
              >
                <span className="text-[#282f44] text-[22px] font-medium font-['Poppins']">
                  {range.min} - {range.max} Cans: ${Number(range.price).toFixed(2)}
                </span>
                <button
                  onClick={() => removePriceRangeEntry(index)}
                  className="text-red-500"
                >
                  <CircleX size={22} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500">
              No custom price ranges defined.
            </p>
          )}
        </div>

        {/* Input fields for adding a new custom price range */}
        <div className="mb-1 border pl-2 pt-2 rounded-lg border-[#3f6075]/40">
          <div className="flex items-center mb-2 space-x-4">
            <div className="flex flex-col w-1/4 rounded-lg">
              <label className="text-sm mb-1 text-left">Min</label>
              <input
                type="number"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="px-2 py-1 border border-[#3f6075]/90 rounded-lg h-[34px] w-[66px]"
              />
            </div>
            <div className="flex flex-col w-1/4 rounded-lg">
              <label className="text-sm mb-1 text-left">Max</label>
              <input
                type="number"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className="px-2 py-1 border border-[#3f6075]/90 rounded-lg h-[34px] w-[66px]"
              />
            </div>
            <div className="flex flex-col w-1/4 rounded-lg">
              <label className="text-sm mb-1 text-left">Price</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="px-2 py-1 border border-[#3f6075]/90 rounded-lg h-[34px] w-[66px]"
              />
            </div>
            <button
              onClick={addPriceRangeEntry}
              className="btn btn-sm text-white mt-6 h-10 px-5 py-2.5 bg-[#009b7c]"
            >
              Add +
            </button>
          </div>
        </div>

        {/* Display User ID and Product ID for reference */}
        <p className="text-center text-sm text-gray-500">
          User ID: {manualUserId} | Product ID: {id}
        </p>

        {/* Save Button */}
        <button
          onClick={savePriceRanges}
          className="btn text-black bg-[radial-gradient(circle,_#fae255_0%,_#a06a0f_100%)] hover:bg-amber-500 border-none text-sm px-3 py-2 w-full mb-4"
        >
          Save Custom Price Ranges
        </button>
      </div>
    </div>
  );
};

export default Products;
