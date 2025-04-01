"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import { getUserRole } from "@/app/utils/getUserRole";

const ProductCard = ({ product }) => {
  const { id, Name, Stock, Description, category, Image, rating, documentId, variant } = product;
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null); // Store user ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const imageUrl = Image?.url || "/4.png";
  const fullImageUrl = `https://pouchesworldwide.com/strapi${imageUrl}`;

  const addToCart = useCartStore((state) => state.addToCart);

  // State for selected strengths and their quantities
  const [selectedStrengths, setSelectedStrengths] = useState([]);

  // Extract unique strengths from the variant array
  const strengths = variant ? variant
    .map((v) => v.strength?.name) // Get strength names
    .filter((name, index, self) => name && self.indexOf(name) === index) : []; // Remove duplicates

  useEffect(() => {
    // Fetch user role & username
    const fetchUserRole = async () => {
      const user = await getUserRole();
      setUserRole(user?.role);
      setUsername(user?.username);
    };
    fetchUserRole();

    // Get user data from localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.id);
      }
    }
  }, []);

  // Handle strength selection and quantity adjustment
  const handleStrengthClick = (strength) => {
    setSelectedStrengths((prev) => {
      const existingIndex = prev.findIndex((item) => item.strength === strength);
      if (existingIndex >= 0) {
        // If the strength is already selected, remove it
        return prev.filter((item) => item.strength !== strength);
      } else {
        // If the strength is not selected, add it with a minimum quantity of 5
        return [...prev, { strength, quantity: 5 }];
      }
    });
  };

  // Handle increment and decrement for a specific strength
  const handleIncrement = (strength) => {
    setSelectedStrengths((prev) =>
      prev.map((item) =>
        item.strength === strength
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecrement = (strength) => {
    setSelectedStrengths((prev) =>
      prev
        .map((item) =>
          item.strength === strength
            ? { ...item, quantity: Math.max(5, item.quantity - 1) } // Ensure quantity doesn't go below 5
            : item
        )
        .filter((item) => item.quantity > 0) // Remove if quantity reaches 0
    );
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (selectedStrengths.length === 0) {
      setError("Please select at least one strength.");
      return;
    }

    // Create orders for each selected strength
    selectedStrengths.forEach((selected) => {
      // Find the variant that matches the selected strength
      const selectedVariant = variant.find(
        (v) => v.strength?.name === selected.strength
      );

      if (!selectedVariant) {
        setError(`Selected strength "${selected.strength}" not found in variants.`);
        return;
      }

      // Create the order object
      const order = {
        ...selectedVariant.product, // Use the selected variant's product as the main product
        variantId: selectedVariant.id, // Include variant ID
        strength: selected.strength, // Selected strength
        quantity: selected.quantity, // Selected quantity
        price: selectedVariant.product.price, // Use the variant product's price
        imageUrl: fullImageUrl, // Full image URL
        productId: selectedVariant.product.id, // Include the variant's product ID
      };

      addToCart(order); // Add the order to the cart
    });

    // Reset selection after adding to cart
    setSelectedStrengths([]);
    setError(null);
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="card w-[297px] h-[470px] bg-neutral shadow-xl relative flex flex-col cursor-pointer animate-pulse">
      {/* Image Skeleton */}
      <div className="px-8 pt-6">
        <div className="w-[200px] h-[200px] bg-gray-300 rounded-lg"></div>
      </div>

      {/* Content Skeleton */}
      <div className="card-body p-6 flex flex-col flex-grow">
        <div className="flex flex-col items-center">
          {/* Product Name Skeleton */}
          <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>

          {/* Document ID Skeleton */}
          <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>

          {/* Rating Stars Skeleton */}
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="w-4 h-4 bg-gray-300 rounded-full mx-1"></div>
            ))}
          </div>
        </div>

        {/* Price and Selector Skeleton */}
        <div className="flex justify-between items-center mt-4">
          <div className="w-32 h-10 bg-gray-300 rounded"></div>
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
        </div>

        {/* Add to Cart Button Skeleton */}
        <div className="w-full h-10 bg-gray-300 rounded mt-2 mb-6"></div>
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="card w-[300px] bg-neutral shadow-xl relative flex flex-col cursor-pointer">
          {/* Product Link */}
          <Link href={`/product/${id}`} passHref>
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
          </Link>

          {/* Card Content */}
          <div className="card-body p-6 flex flex-col flex-grow">
            <div className="flex flex-col items-center">
              {/* Display User ID */}
              <div style={{ display: "none" }}>
                {userId && <p className="text-sm text-gray-400">User ID: {userId}</p>}
              </div>

              {/* Product Name */}
              <Link href={`/product/${id}`} passHref>
                <h2 className="text-center font-semibold text-primary text-[16px] font-poppins">
                  {Name}
                </h2>
              </Link>

              {/* Rating Stars */}
              <div className="flex justify-center mt-2">
                <div className="rating">
                  {[...Array(5)].map((_, index) => (
                    <input
                      key={index}
                      type="radio"
                      name={`rating-${id}`}
                      className={`mask mask-star-2 ${index < rating ? "" : "bg-gray-400"}`}
                      style={index < rating ? { background: "linear-gradient(to right, #fae255 0%, #a06a0f 100%)" } : {}}
                      defaultChecked={index < rating}
                      readOnly
                      disabled
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Strength Buttons */}
            <div className="flex flex-col gap-4 mt-4">
              {strengths.map((strength) => {
                const selected = selectedStrengths.find((item) => item.strength === strength);
                return (
                  <div key={strength} className="flex flex-col items-center">
                    <button
                      onClick={() => handleStrengthClick(strength)}
                      className={`btn-sm rounded-lg w-[250px] ${
                        selected
                          ? "bg-black text-white text-bold"
                          : "bg-gray-300"
                      } border-none text-sm px-3 py-2`}
                    >
                      {strength}
                    </button>
                    {selected && (
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleDecrement(strength)}
                          className="bg-gray-300 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-base font-semibold">{selected.quantity}</span>
                        <button
                          onClick={() => handleIncrement(strength)}
                          className="bg-gray-300 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add to Cart Button */}
            <button
              className="btn bg-[radial-gradient(circle,_#fae255_0%,_#a06a0f_100%)] border-none text-sm px-3 py-2 w-full mt-2 mb-6"
              onClick={handleAddToCart}
            >
              Add To Cart +
            </button>

            {/* Error Messages */}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;