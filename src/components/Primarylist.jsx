"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./C_ProductCard";
import { fetchAllProducts } from "../app/utils/fetchProducts"; // Import the utility function

const PrimaryList = () => {
  const [activeTab, setActiveTab] = useState("new");
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
 
   // Fetch data from the API
   useEffect(() => {
     const fetchProducts = async () => {
       try {
         const productsData = await fetchAllProducts(); // Use the utility function
         setProducts(productsData); // Set the fetched products
         setLoading(false);
       } catch (error) {
         setError(error.message);
         setLoading(false);
       }
     };
 
     fetchProducts();
   }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-center mb-14">
        <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center"> {/* Centering buttons horizontally */}
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium rounded-lg transition-colors whitespace-nowrap flex items-center
              ${activeTab === "new" ? "bg-primary text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
          >
            New Arrivals
            {/* Green Animated Dot on the Right */}
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></span>
          </button>
          <button
            onClick={() => setActiveTab("best")}
            className={`px-4 sm:px-6 py-2 text-base sm:text-lg font-medium rounded-lg transition-colors whitespace-nowrap
              ${activeTab === "best" ? "bg-primary text-white" : "bg-transparent text-black hover:bg-gray-100"}`}
          >
            Best Selling
          </button>
        </div>
      </div>

      {/* Tab content with centered grid */}
      <div className="mt-8">
      {activeTab === "new" && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 justify-items-center">
      {products
       // .filter((product) => product.position === "New") // Filter only "New" products
        .slice(0, 8)
        .map((product) => (
          <div key={product.id} className="w-full max-w-sm flex justify-center">
            <ProductCard product={product} />
          </div>
        ))}
    </div>
  )}

        {activeTab === "best" && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 justify-items-center">
         {products
        //  .filter((product) => product.position === "Best")
         .slice(0, 8).map((product) => (
           <div key={product.id} className="w-full max-w-sm flex justify-center"> {/* Center ProductCard on small screens */}
             <ProductCard product={product} />
           </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrimaryList;
