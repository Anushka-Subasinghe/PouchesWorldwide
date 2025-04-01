"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleArrowRight, Search } from "lucide-react";

const OrderTable = ({ onSelectUser, selectedOrderEmail, order }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredStock, setFilteredStock] = useState([]); // State for filtered stock results

  // Fetch user data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://pouchesworldwide.com/strapi/api/users/");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();

        // Filter data based on your conditions (wholesaler/distributor, confirmed, blocked false)
        const filteredData = result.filter(
          (item) =>
            (item.urole === "wholesaler" || item.urole === "distributor") &&
            item.confirmed === true &&
            item.blocked === false
        );
        setData(filteredData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch inventory data from the API
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await fetch(
          "https://pouchesworldwide.com/strapi/api/inventories?populate[stock][populate]=*&populate=user"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch inventory data");
        }
        const result = await response.json();
        setInventoryData(result.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchInventoryData();
  }, []);

  // Automatically extract product IDs and cans from order.cart
  useEffect(() => {
    if (order.cart && order.cart.length > 0) {
      const productIds = order.cart.map((item) => item.id);
      const cans = order.cart.map((item) => item.selectedCans * item.quantity);

      // Group stock data by user
      const userStockMap = new Map();

      inventoryData.forEach((inventory) => {
        inventory.user.forEach((user) => {
          if (!userStockMap.has(user.id)) {
            userStockMap.set(user.id, {
              username: user.username,
              address: user.address,
              stocks: [],
            });
          }

          inventory.stock.forEach((stock) => {
            userStockMap.get(user.id).stocks.push({
              stockId: stock.id,
              productId: stock.product?.id,
              cans: stock.Cans,
            });
          });
        });
      });

      // Filter users who have all the requested products with the required cans
      // AND whose address (city) matches the order's address.city if provided.
      const filteredUsers = Array.from(userStockMap.entries()).filter(([userId, userData]) => {
        // Check city filter: if order has a city defined, only allow users with a matching address.
        if (order.address?.city && userData.address !== order.address.city) {
          return false;
        }
        return productIds.every((productId, index) => {
          return userData.stocks.some(
            (stock) =>
              stock.productId === productId && stock.cans > cans[index]
          );
        });
      });

      // Format the filtered results
      const filtered = filteredUsers.map(([userId, userData]) => ({
        userId,
        username: userData.username,
        address: userData.address,
        stocks: userData.stocks.filter((stock) =>
          productIds.includes(stock.productId)
        ),
      }));

      setFilteredStock(filtered);
    }
  }, [order.cart, inventoryData, order.address]);

  // If there's a search term, filter based on the address, otherwise show all data
  const filteredData = search
    ? data.filter((item) =>
        item.address && item.address.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  // Filter out the user whose email matches the selectedOrderEmail
  const filteredDataWithoutSelectedEmail = filteredData.filter(
    (item) => item.email !== selectedOrderEmail
  );

  const handleArrowClick = (userId) => {
    router.push(`/admin/whalesellers/sellerDetails/${userId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-2">
      {/* Add Order Processor Table */}
      <div className="flex justify-between items-center mb-12">
        <div className="text-black text-xl font-medium">Add Order Processor</div>
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search by Location..."
            className="input input-bordered border-[#3e5f75] w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="border-b-0 text-base text-[#282f44]">
              <th>Username</th>
              <th>Location</th>
              <th>Stock IDs</th>
              <th>Cans</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* Display filtered stock results */}
            {filteredStock.length > 0
              ? filteredStock.map((user, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#3f6075] text-xl font-medium text-black"
                  >
                    <td className="text-xl font-['Poppins'] capitalize">{user.username}</td>
                    <td className="text-xl font-['Poppins']">{user.address}</td>
                    <td className="text-xl font-['Poppins']">
                      {user.stocks.map((stock) => stock.stockId).join(", ")}
                    </td>
                    <td className="text-xl font-['Poppins']">
                      {user.stocks.map((stock) => stock.cans).join(", ")}
                    </td>
                    <td>
                      <button
                        className="btn h-12 btn-sm btn-ghost bg-gradient-to-br from-[#f5d061] to-[#e6af2e] text-black"
                        onClick={() => onSelectUser(user.userId)}
                      >
                        Select <CircleArrowRight className="w-[28px] h-[28px] text-black" />
                      </button>
                    </td>
                  </tr>
                ))
              : filteredDataWithoutSelectedEmail.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#3f6075] text-xl font-medium text-black"
                  >
                    <td
                      className="text-xl font-['Poppins'] capitalize cursor-pointer"
                      onClick={() => handleArrowClick(item.id)}
                    >
                      {item.username}
                    </td>
                    <td className="text-xl font-['Poppins']">{item.address}</td>
                    <td className="text-xl font-['Poppins']">N/A</td>
                    <td className="text-xl font-['Poppins']">N/A</td>
                    <td>
                      <button
                        className="btn h-12 btn-sm btn-ghost bg-gradient-to-br from-[#f5d061] to-[#e6af2e] text-black"
                        onClick={() => onSelectUser(item.id)}
                      >
                        Select <CircleArrowRight className="w-[28px] h-[28px] text-black" />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
