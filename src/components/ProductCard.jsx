'use client';
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import { getUserRole } from "@/app/utils/getUserRole";

const ProductCard = ({ product }) => {
  const { id, Name, Stock, Description, category, Image, rating, documentId } = product;
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const imageUrl = Image?.formats?.medium?.url || Image?.url || "/4.png";
  const fullImageUrl = `https://pouchesworldwide.com/strapi${imageUrl}`;

  const addToCart = useCartStore((state) => state.addToCart);

  // State for selected quantities (strength values) and their counts
  const [selectedQuantities, setSelectedQuantities] = useState([]);

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

  const handleQuantityClick = (mg) => {
    setSelectedQuantities((prev) => {
      const existingIndex = prev.findIndex((item) => item.mg === mg);
      if (existingIndex >= 0) {
        const updatedQuantities = [...prev];
        updatedQuantities[existingIndex].count += 1;
        return updatedQuantities;
      } else {
        return [...prev, { mg, count: 1 }];
      }
    });
  };

  const handleIncrement = (mg) => {
    setSelectedQuantities((prev) =>
      prev.map((item) =>
        item.mg === mg ? { ...item, count: item.count + 1 } : item
      )
    );
  };

  const handleDecrement = (mg) => {
    setSelectedQuantities((prev) =>
      prev
        .map((item) =>
          item.mg === mg ? { ...item, count: Math.max(0, item.count - 1) } : item
        )
        .filter((item) => item.count > 0)
    );
  };

  // Compute effective price ranges:
  // If product.custom_price_ranges exists for the current user, use that.
  // Otherwise, fallback to product.price_ranges.
  // If neither exists, we'll show product.price.
  const effectivePriceRanges = 
  product.custom_price_ranges &&
  userId &&
  Array.isArray(product.custom_price_ranges[userId]) &&
  product.custom_price_ranges[userId].length > 0
    ? product.custom_price_ranges[userId]
    : Array.isArray(product.price_ranges)
      ? product.price_ranges
      : [];


  // Sort effective price ranges by min value.
  const sortedRanges = [...effectivePriceRanges].sort((a, b) => a.min - b.min);

  // If sortedRanges exist, use the lowest range's price per item.
  // Otherwise, fallback to product.price.
  const lowestPrice = sortedRanges.length > 0 ? sortedRanges[0].price : product.price;

  const handleAddToCart = () => {
    if (selectedQuantities.length === 0) {
      setError("Please select at least one strength.");
      return;
    }

    selectedQuantities.forEach((item) => {
      const order = {
        ...product,
        price: lowestPrice, // Use the lowest price per unit
        strength: item.mg,
        count: item.count,
        imageUrl: fullImageUrl,
      };
      addToCart(order);
    });

    setSelectedQuantities([]);
  };

  return (
    <>
      {loading ? (
        <div className="card w-[297px] h-[470px] bg-neutral shadow-xl relative flex flex-col cursor-pointer animate-pulse">
          {/* Skeleton content omitted for brevity */}
        </div>
      ) : (
        <div className="card w-[300px] bg-neutral shadow-xl relative flex flex-col cursor-pointer">
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
          <div className="card-body p-6 flex flex-col flex-grow">
            <div className="flex flex-col items-center">
              <div style={{ display: "none" }}>
                {userId && <p className="text-sm text-gray-400">User ID: {userId}</p>}
              </div>
              <Link href={`/product/${id}`} passHref>
                <h2 className="text-center font-semibold text-primary text-[16px] font-poppins">
                  {Name}
                </h2>
              </Link>
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
            {/* Display Price Per Unit based on the lowest price range or fallback */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-xl font-semibold">Price Per Unit</span>
              <span className="text-xl font-semibold">
                ${lowestPrice ? lowestPrice.toFixed(2) : 'N/A'}
              </span>
            </div>

            {/* Quantity Buttons */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex justify-between">
                {[6, 12, 16].map((mg) => {
                  const selectedItem = selectedQuantities.find((item) => item.mg === mg);
                  return (
                    <div key={mg} className="flex flex-col items-center">
                      <button
                        onClick={() => handleQuantityClick(mg)}
                        className={`btn-sm rounded-lg w-[75px] h-[5px] ${
                          selectedItem
                            ? "bg-black text-white text-bold"
                            : "bg-gray-300"
                        } border-none text-base`}
                      >
                        {mg}mg
                      </button>
                      {selectedItem && (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleDecrement(mg)}
                            className="bg-gray-300 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-base font-semibold">{selectedItem.count}</span>
                          <button
                            onClick={() => handleIncrement(mg)}
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
              <div className="flex justify-center">
                {[22].map((mg) => {
                  const selectedItem = selectedQuantities.find((item) => item.mg === mg);
                  return (
                    <div key={mg} className="flex flex-col items-center">
                      <button
                        onClick={() => handleQuantityClick(mg)}
                        className={`btn-sm rounded-lg w-[250px] ${
                          selectedItem
                            ? "bg-black text-white text-bold"
                            : "bg-gray-300"
                        } border-none text-sm  px-3 py-2`}
                      >
                        {mg}mg
                      </button>
                      {selectedItem && (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleDecrement(mg)}
                            className="bg-gray-300 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-base font-semibold">{selectedItem.count}</span>
                          <button
                            onClick={() => handleIncrement(mg)}
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
            </div>

            {/* Add to Cart Button */}
            <button
              className="btn bg-[radial-gradient(circle,_#fae255_0%,_#a06a0f_100%)] border-none text-sm px-3 py-2 w-full mt-2 mb-6"
              onClick={handleAddToCart}
            >
              Add To Cart +
            </button>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
