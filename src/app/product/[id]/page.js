'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';
import Header from "../../../components/Header"; 
import Banner from '../../../components/Banner';
import Footer from "@/components/Footer";
import Selector from "@/components/Selector";
import ProductCard from "@/components/C_ProductCard";
import Guidelines from '@/components/Guidelines';
import { MoveLeft, MoveRight } from "lucide-react";
import BlackBanner from '@/components/BlackBanner';
import Pagination from '@/components/Pagination';
import useCartStore from "@/store/cartStore"; // Import Zustand store
import { fetchProducts } from "../../utils/fetchProducts"; // Updated utility function
import { getUserRole } from "@/app/utils/getUserRole";
import ReviewSection from "@/components/ReviewSection";
import Preloader from "@/components/Preloader";  // Import Preloader

export default function ProductPage({ params }) {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const addToCart = useCartStore((state) => state.addToCart);

  // State to store fetched products
  const [products, setProducts] = useState([]);
  // Use a numeric state for quantity (default 15)
  const [selectedQuantity, setSelectedQuantity] = useState(15);
  // Dynamic pricing states
  const [pricePerItem, setPricePerItem] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);

  const [loading, setLoading] = useState(true); // Loading state
  const [userId, setUserId] = useState(null); // Store user ID
  const [userRole, setUserRole] = useState(null);

  const [strengths, setStrengths] = useState([]); // State to store strengths
  const [selectedStrength, setSelectedStrength] = useState("");

  // Get user role on component mount
  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  // Get user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser?.id);
      }
    }
  }, []);

  // Fetch products using the new fetchAllProducts utility
  useEffect(() => {
    const getProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts(); // Use the updated utility
        console.log(fetchProducts);
        setProducts(fetchedProducts); // Store the fetched products in state
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    getProducts(); // Call the function to fetch the products
  }, []);

  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);

  // Find the product based on the ID
  const product = products.find((p) => p.id === parseInt(unwrappedParams.id));

  // Compute effective price ranges:
  // If the product has custom_price_ranges keyed by userId, use that array,
  // otherwise fallback to product.price_ranges.
  const effectivePriceRanges =
    product && userId &&
    product.custom_price_ranges &&
    product.custom_price_ranges[userId] &&
    product.custom_price_ranges[userId].length > 0
      ? product.custom_price_ranges[userId]
      : product && userId ? product.price_ranges || [] : [];

  // Update the dynamic pricing when the selected quantity or effectivePriceRanges change.
  useEffect(() => {
    const q = selectedQuantity;
    let applicableRange;
    if (effectivePriceRanges.length > 0) {
      // Sort ranges by minimum quantity
      const sortedRanges = [...effectivePriceRanges].sort((a, b) => a.min - b.min);
      // Find the range where q is between min and max
      applicableRange = sortedRanges.find(range => q >= range.min && q <= range.max);
      // If q is greater than all range max values, use the highest range.
      if (!applicableRange && q > sortedRanges[sortedRanges.length - 1].max) {
        applicableRange = sortedRanges[sortedRanges.length - 1];
      }
      // Fallback to the first range if nothing is found
      if (!applicableRange) {
        applicableRange = sortedRanges[0];
      }
    }
    if (applicableRange) {
      setPricePerItem(applicableRange.price);
      setCurrentPrice(q * applicableRange.price);
    } else {
      setPricePerItem(0);
      setCurrentPrice(0);
    }
  }, [selectedQuantity, effectivePriceRanges]);

  // Extract strengths from the current product's variants
  useEffect(() => {
    if (product && product.variant) {
      const variantStrengths = product.variant.map((variant) => variant.strength.name);
      setStrengths(variantStrengths); // Set the strengths for the current product
    }
  }, [product]);

  // Handle strength selection
  const handleStrengthChange = (event) => {
    setSelectedStrength(event.target.value);
  };

  if (!product) {
    return <Preloader />;
  }

  const guidelines = product.Guidelines?.map((item) => item.children[0].text) || [];

  const handleRequestClick = () => {
    if (customAmount) {
      // Redirect to the request page with query parameters
      router.push(`/request?customAmount=${customAmount}&productId=${unwrappedParams.id}`);
    }
  };

  const imageUrlProduct = product.Image?.formats?.medium?.url || product.Image?.url || '/4.png';
  const fullImageUrl = `https://pouchesworldwide.com/strapi${imageUrlProduct}`;
  const description = product.Description?.[0]?.children?.[0]?.text || 'No description available';

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex w-full flex-col lg:flex-row">
          <div className="card flex-grow place-items-center">
            <div className="w-[603px] h-[540px] relative">
              <div className="w-[600px] h-[500px] left-0 top-0 absolute bg-neutral rounded-[5px] pt-4" />
              <div className="absolute left-0 top-0 w-full h-full">
                <img
                  src={fullImageUrl}
                  alt={product.Name}
                  className="w-full h-full object-cover rounded-[5px]"
                />
              </div>
            </div>
            <div className="mb-12">
              <Guidelines guidelines={guidelines} />
            </div>
          </div>

          <div className="card flex-grow place-items-center">
            {/* Product Details */}
            <div className="bg-white p-8 rounded-lg">
              <div className="flex justify-between items-center">
                <h1 className="text-[28px] font-bold text-primary mb-4">{product.Name}</h1>
                <div className="w-28 h-[57px] px-[17px] py-1.5 bg-gradient-to-r from-[#009b7c] via-[#0bbf9c] to-[#009b7d] rounded-[10px] justify-center items-center gap-2.5 inline-flex">
                  <div className="text-white text-sm font-semibold font-['Poppins'] capitalize">
                    in stock
                  </div>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <div className="rating">
                  {[...Array(5)].map((_, index) => (
                    <input
                      key={index}
                      type="radio"
                      name="rating-2" 
                      className="mask mask-star-2 bg-orange-400"
                      defaultChecked={index < product.rating}
                      disabled
                    />
                  ))}
                </div>
              </div>
              <div className="divider"></div>
              <div className="h-[44.18px] justify-start items-end gap-[5px] inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="45"
                  viewBox="0 0 40 45"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23.5294 3.01159L23.6839 4.51616L23.9004 6.62551L25.818 5.72049L26.9616 5.18081L29.0829 4.17965L28.828 6.51147L28.7151 7.54451L28.4603 9.87634L30.5816 8.87518L31.4317 8.47395L33.6427 7.43048L33.2247 9.83932L33.0596 10.7908L32.6944 12.895L34.793 12.4991L36.6675 12.1455L39.5054 11.6101L37.8289 13.9617L17.8542 41.9795L16.2851 44.1804L15.7121 41.5389L15.4519 40.3395L15.0244 38.3691L13.1241 39.0429L12.4287 39.2894L10.4225 40.0007L10.4408 37.8722L10.4462 37.2468L10.4646 35.1183L8.45837 35.8296L7.86885 36.0386L5.86264 36.7499L5.881 34.6214L5.88736 33.8836L5.90475 31.8674L3.90262 32.1057L2.68398 32.2508L0 32.5702L1.56906 30.3694L21.4628 2.4651L23.2202 0L23.5294 3.01159ZM24.7541 8.43419L26.7067 7.51264L26.4721 9.65905L26.0841 13.2093L29.3139 11.685L31.0137 10.8828L30.7239 12.553L30.2306 15.395L33.0652 14.8603L34.991 14.497L31.7783 19.0033L18.7302 9.74334L21.772 5.47669L21.9109 6.82976L22.1994 9.63987L24.7541 8.43419ZM16.9887 12.1861L8.25951 24.4302L21.1632 33.8928L30.0368 21.4461L16.9887 12.1861ZM19.4215 36.3358L6.51783 26.8732L4.25304 30.0499L5.66838 29.8815L7.92427 29.613L7.90468 31.8847L7.88721 33.9101L9.79625 33.2332L12.4891 32.2785L12.4645 35.1355L12.447 37.1609L14.3561 36.4841L16.4973 35.7249L16.979 37.9451L17.2811 39.338L19.4215 36.3358Z"
                    fill="#3F6075"
                  />
                </svg>
                <div>
                  <span className="text-[#39527d] text-[28px] font-medium font-['Poppins'] capitalize">{product.can}</span>
                  <span className="text-[#3e5f75] text-[28px] font-medium font-['Poppins'] capitalize"> pouches </span>
                  <span className="text-[#3e5f75] text-sm font-medium font-['Poppins'] capitalize">in a can</span>
                </div>
              </div>
              <div className="divider"></div>

              <div className="mb-4">
                <label htmlFor="strength-selector" className="block text-gray-700 font-medium">
                  Select Strength:
                </label>
                <select
                  id="strength-selector"
                  className="w-full p-2 border rounded-lg"
                  value={selectedStrength}
                  onChange={handleStrengthChange}
                >
                  <option value="">Choose Strength</option>
                  {strengths.map((strength, index) => (
                    <option key={index} value={strength}> 
                      {strength}
                    </option>
                  ))}
                </select>
              </div> 

              <div className="divider"></div>

              <label htmlFor="quantity" className="block text-gray-700 font-medium">
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="text-[#39527d] text-[20px] font-medium font-['Poppins'] border w-full rounded-lg p-2 mb-2"
              />
              {/* Display dynamic pricing info */}
              <div className="mb-4 text-lg">
                {pricePerItem > 0 ? (
                  <>
                    <div>Total: ${currentPrice.toFixed(2)}</div>
                  </>
                ) : (
                  <div>No pricing available</div>
                )}
              </div>

              <div className="divider"></div>
              <div className="space-y-4 mb-6">
                <p className="text-primary text-[18px]">{description}</p>
              </div>
              {userRole === "wholesaler" && (
                <div
                  className="flex items-center border rounded-lg p-4 bg-white"
                  style={{ width: "540px", height: "119px", flexShrink: 0 }}
                >
                  <div className="flex-grow">
                    <label htmlFor="customAmount" className="text-gray-700 font-medium">
                      Request Custom Amount
                    </label>
                    <input
                      type="number"
                      id="customAmount"
                      className="mt-2 border-b border-gray-300 focus:outline-none focus:border-orange-500 w-full rounded-r-md"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2.5 bg-primary text-white font-bold rounded-md ml-4"
                    style={{ padding: "5px 20px" }}
                    onClick={() => {
                      if (customAmount) {
                        router.push(`/request?customAmount=${customAmount}&productId=${unwrappedParams.id}`);
                      }
                    }}
                  >
                    Request
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="35"
                      height="34"
                      viewBox="0 0 35 34"
                      fill="none"
                    >
                      <path
                        d="M0.812988 29.5895V0.812988L26.532 11.6042H25.9924C24.9433 11.6042 23.9541 11.7241 23.0249 11.9639C22.0956 12.2037 21.1964 12.5334 20.3271 12.9531L4.41005 6.20859V12.5034L15.2012 15.2012L4.41005 17.899V24.1939L14.1221 20.0573C13.8823 20.7467 13.7025 21.4284 13.5826 22.1022C13.4627 22.7773 13.4027 23.4745 13.4027 24.1939V24.2838L0.812988 29.5895ZM25.9924 33.1866C23.5045 33.1866 21.384 32.3101 19.631 30.5571C17.8769 28.8029 16.9998 26.6819 16.9998 24.1939C16.9998 21.7059 17.8769 19.5849 19.631 17.8307C21.384 16.0777 23.5045 15.2012 25.9924 15.2012C28.4804 15.2012 30.6015 16.0777 32.3556 17.8307C34.1086 19.5849 34.9851 21.7059 34.9851 24.1939C34.9851 26.6819 34.1086 28.8029 32.3556 30.5571C30.6015 32.3101 28.4804 33.1866 25.9924 33.1866ZM28.96 28.4205L30.219 27.1615L26.8917 23.8342V18.7983H25.0932V24.5536L28.96 28.4205ZM4.41005 20.0573V6.20859V24.1939V20.0573Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <div
                className="w-[244px] px-3 py-2 mt-6 bg-[radial-gradient(circle,_#fae255_0%,_#a06a0f_100%)] rounded-md flex items-end justify-end gap-[10px] cursor-pointer hover:shadow-lg transition-shadow duration-200 ml-auto"
                onClick={(e) => {
                  e.preventDefault();
                  addToCart({
                    ...product,
                    price: currentPrice,
                    selectedCans: selectedQuantity, 
                    imageUrl: fullImageUrl,
                    strength: selectedStrength
                  });
                }}
              >
                <div className="text-[#282f44] text-[28px] font-medium font-['Poppins'] capitalize leading-[39.20px]">
                  Add to cart +
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {userRole === "guest" ? (
        // Show small banner row only for guests
        <div className="w-full h-[109px] px-[140px] bg-black shadow-[0px_0px_17px_0px_rgba(245,208,97,0.25)] border justify-center items-center gap-[84px] inline-flex">
          <div className="flex flex-col items-start"> {/* Align items to the start (left) */}
  <div className="w-9 h-9">
    <svg width="98" height="24" viewBox="0 0 98 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5702 2.90431C11.8405 2.07238 13.0175 2.07238 13.2878 2.90431L14.8618 7.7486C14.9827 8.12065 15.3294 8.37255 15.7206 8.37255H20.8142C21.6889 8.37255 22.0526 9.4919 21.3449 10.0061L17.2241 13C16.9076 13.2299 16.7752 13.6375 16.8961 14.0096L18.4701 18.8538C18.7404 19.6858 17.7882 20.3776 17.0805 19.8634L12.9598 16.8695C12.6433 16.6395 12.2147 16.6395 11.8982 16.8695L7.77743 19.8634C7.06975 20.3776 6.11757 19.6858 6.38788 18.8538L7.96189 14.0096C8.08277 13.6375 7.95034 13.2299 7.63386 13L3.51306 10.0061C2.80538 9.4919 3.16908 8.37255 4.04383 8.37255H9.13741C9.5286 8.37255 9.87531 8.12065 9.9962 7.7486L11.5702 2.90431Z" fill="white"/>
      <path d="M35.9508 2.90431C36.2211 2.07238 37.3981 2.07238 37.6684 2.90431L39.2424 7.7486C39.3633 8.12065 39.71 8.37255 40.1012 8.37255H45.1948C46.0695 8.37255 46.4332 9.4919 45.7255 10.0061L41.6047 13C41.2883 13.2299 41.1558 13.6375 41.2767 14.0096L42.8507 18.8538C43.121 19.6858 42.1688 20.3776 41.4612 19.8634L37.3404 16.8695C37.0239 16.6395 36.5953 16.6395 36.2788 16.8695L32.158 19.8634C31.4504 20.3776 30.4982 19.6858 30.7685 18.8538L32.3425 14.0096C32.4634 13.6375 32.331 13.2299 32.0145 13L27.8937 10.0061C27.186 9.4919 27.5497 8.37255 28.4244 8.37255H33.518C33.9092 8.37255 34.2559 8.12065 34.3768 7.7486L35.9508 2.90431Z" fill="white"/>
      <path d="M60.3314 2.90431C60.6017 2.07238 61.7787 2.07238 62.049 2.90431L63.623 7.7486C63.7439 8.12065 64.0906 8.37255 64.4818 8.37255H69.5754C70.4501 8.37255 70.8138 9.4919 70.1061 10.0061L65.9854 13C65.6689 13.2299 65.5364 13.6375 65.6573 14.0096L67.2313 18.8538C67.5016 19.6858 66.5495 20.3776 65.8418 19.8634L61.721 16.8695C61.4045 16.6395 60.9759 16.6395 60.6595 16.8695L56.5387 19.8634C55.831 20.3776 54.8788 19.6858 55.1491 18.8538L56.7231 14.0096C56.844 13.6375 56.7116 13.2299 56.3951 13L52.2743 10.0061C51.5666 9.4919 51.9303 8.37255 52.8051 8.37255H57.8986C58.2898 8.37255 58.6365 8.12065 58.7574 7.7486L60.3314 2.90431Z" fill="white"/>
      <path d="M84.712 2.90431C84.9824 2.07238 86.1593 2.07238 86.4296 2.90431L88.0036 7.7486C88.1245 8.12065 88.4712 8.37255 88.8624 8.37255H93.956C94.8307 8.37255 95.1944 9.4919 94.4868 10.0061L90.366 13C90.0495 13.2299 89.9171 13.6375 90.0379 14.0096L91.6119 18.8538C91.8823 19.6858 90.9301 20.3776 90.2224 19.8634L86.1016 16.8695C85.7851 16.6395 85.3566 16.6395 85.0401 16.8695L80.9193 19.8634C80.2116 20.3776 79.2594 19.6858 79.5297 18.8538L81.1037 14.0096C81.2246 13.6375 81.0922 13.2299 80.7757 13L76.6549 10.0061C75.9472 9.4919 76.3109 8.37255 77.1857 8.37255H82.2793C82.6705 8.37255 83.0172 8.12065 83.138 7.7486L84.712 2.90431Z" fill="white"/>
    </svg>
  </div>
  <div className="text-[22px] font-light text-white capitalize">4.5+ Ratings</div>
</div>
          <div className="justify-center items-center gap-[26px] flex">
            <div data-svg-wrapper>
              <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.1666 16.625C12.1666 17.7479 13.0416 18.6667 14.1062 18.6667H16.2937C17.227 18.6667 17.9854 17.8646 17.9854 16.8875C17.9854 15.8229 17.5187 15.4437 16.8333 15.1958L13.3333 13.9708C12.6333 13.7229 12.1666 13.3438 12.1666 12.2792C12.1666 11.3021 12.925 10.5 13.8583 10.5H16.0458C17.125 10.5146 18 11.4188 18 12.5417" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.0834 18.7395V19.8187" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.0834 9.3479V10.4854" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.0687 26.2209C21.504 26.2209 26.7208 21.0041 26.7208 14.5688C26.7208 8.13356 21.504 2.91675 15.0687 2.91675C8.63344 2.91675 3.41663 8.13356 3.41663 14.5688C3.41663 21.0041 8.63344 26.2209 15.0687 26.2209Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4292 28.9916C20.7417 30.8437 22.8855 32.0541 25.3355 32.0541C29.3167 32.0541 32.5542 28.8166 32.5542 24.8353C32.5542 22.4145 31.3584 20.2708 29.5354 18.9583" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-white text-xl font-light font-['Poppins']">Best Price & Assortment</div>
          </div>
          <div className="justify-center items-center gap-[26px] flex">
            <div data-svg-wrapper>
              <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.375 2.91675V17.5001C22.375 19.1042 21.0625 20.4167 19.4583 20.4167H3.41663V8.75008C3.41663 5.52716 6.02704 2.91675 9.24996 2.91675H22.375Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32.5833 20.4167V24.7917C32.5833 27.2126 30.6291 29.1667 28.2083 29.1667H26.75C26.75 27.5626 25.4375 26.2501 23.8333 26.2501C22.2291 26.2501 20.9166 27.5626 20.9166 29.1667H15.0833C15.0833 27.5626 13.7708 26.2501 12.1666 26.2501C10.5625 26.2501 9.24996 27.5626 9.24996 29.1667H7.79163C5.37079 29.1667 3.41663 27.2126 3.41663 24.7917V20.4167H19.4583C21.0625 20.4167 22.375 19.1042 22.375 17.5001V7.29175H25.0583C26.1083 7.29175 27.0708 7.86051 27.5958 8.76468L30.0896 13.1251H28.2083C27.4062 13.1251 26.75 13.7813 26.75 14.5834V18.9584C26.75 19.7605 27.4062 20.4167 28.2083 20.4167H32.5833Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.1667 32.0833C13.7775 32.0833 15.0833 30.7775 15.0833 29.1667C15.0833 27.5558 13.7775 26.25 12.1667 26.25C10.5558 26.25 9.25 27.5558 9.25 29.1667C9.25 30.7775 10.5558 32.0833 12.1667 32.0833Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23.8333 32.0833C25.4441 32.0833 26.75 30.7775 26.75 29.1667C26.75 27.5558 25.4441 26.25 23.8333 26.25C22.2225 26.25 20.9166 27.5558 20.9166 29.1667C20.9166 30.7775 22.2225 32.0833 23.8333 32.0833Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32.5833 17.5V20.4167H28.2083C27.4062 20.4167 26.75 19.7604 26.75 18.9583V14.5833C26.75 13.7812 27.4062 13.125 28.2083 13.125H30.0896L32.5833 17.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-white text-xl font-light font-['Poppins']">Express Shipping</div>
          </div>
          <div className="justify-center items-center gap-[26px] flex">
            <div data-svg-wrapper>
              <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.31714 21.3797L4.10049 19.163C3.19632 18.2589 3.19632 16.7713 4.10049 15.8672L6.31714 13.6505C6.69631 13.2713 7.00256 12.5276 7.00256 12.0026V8.86711C7.00256 7.58377 8.05257 6.53381 9.3359 6.53381H12.4713C12.9963 6.53381 13.7401 6.2276 14.1192 5.84843L16.3359 3.63174C17.24 2.72757 18.7276 2.72757 19.6317 3.63174L21.8484 5.84843C22.2276 6.2276 22.9713 6.53381 23.4963 6.53381H26.6318C27.9151 6.53381 28.9651 7.58377 28.9651 8.86711V12.0026C28.9651 12.5276 29.2713 13.2713 29.6505 13.6505L31.8672 15.8672C32.7713 16.7713 32.7713 18.2589 31.8672 19.163L29.6505 21.3797C29.2713 21.7589 28.9651 22.5026 28.9651 23.0276V26.1629C28.9651 27.4462 27.9151 28.4964 26.6318 28.4964H23.4963C22.9713 28.4964 22.2276 28.8026 21.8484 29.1818L19.6317 31.3985C18.7276 32.3026 17.24 32.3026 16.3359 31.3985L14.1192 29.1818C13.7401 28.8026 12.9963 28.4964 12.4713 28.4964H9.3359C8.05257 28.4964 7.00256 27.4462 7.00256 26.1629V23.0276C7.00256 22.4881 6.69631 21.7443 6.31714 21.3797Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.625 21.875L22.375 13.125" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21.6378 21.1459H21.6509" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.3462 13.8542H14.3593" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-white text-xl font-light font-['Poppins']">Get a Discount</div>
          </div>
        </div>
      ) : (
        // Show ReviewSection for non-guest users
        <ReviewSection />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-6">
          <div className="w-[382.79px] h-[114.91px] relative">
            <div className="w-[153.69px] h-[47px] left-[236.53px] top-0 absolute origin-top-left rotate-[17.89deg] bg-gradient-to-r from-[#009b7c] via-[#009b7d] to-[#009b7d] rounded-[14px]">
              <div className="left-[26px] top-[10px] absolute text-white text-lg font-medium font-['Poppins'] capitalize">best deals</div>
              <div className="w-1.5 h-1.5 left-[137.70px] top-[9.62px] absolute origin-top-left rotate-[-17.89deg] bg-white rounded-full" />
            </div>
            <div className="left-0 top-[57.91px] absolute text-black text-[38px] font-semibold font-['Poppins'] capitalize">Best deals today</div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 h-[300px] bg-black z-0 mt-[935px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative ">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="w-full max-w-sm flex justify-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        {/*large banner
          <div className="relative flex justify-center items-center w-full h-[352px] mt-[200px] mb-[160px]">
            <div className="absolute inset-0 h-[225px] bg-black z-0 w-full"></div>
            <Link href="/">
              <div className="relative z-10">
                <Image
                  src="https://pouchesworldwide.com/strapi/uploads/fruitybanner_9235e897dc.jpg"
                  alt="Banner Image"
                  width={1144}
                  height={352}
                  priority
                  className="object-cover w-full rounded-lg"
                />
              </div>
            </Link>
          </div>*/}
        </div>
      </div>
      <Footer />
    </>
  );
}
