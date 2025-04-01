"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/AdminUi/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import PendingCard from "@/components/AdminUi/orderdetail/PendingCard";
import OrderTable from "@/components/AdminUi/orderdetail/OrderTable";

const Details = () => { 
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId"); // Extract orderId from URL

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All fetched users
  const [users, setUsers] = useState([]); // Users after filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderEmail, setSelectedOrderEmail] = useState(null); // Selected order's email

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("https://pouchesworldwide.com/strapi/api/all-orders?populate=*");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setOrders(result.data || []);
      } catch (err) {
        setError(err.message || "Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    // Fetch users and store them in allUsers (unfiltered)
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://pouchesworldwide.com/strapi/api/users/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const usersData = await response.json();
        setAllUsers(usersData || []);
      } catch (err) {
        setError(err.message || "Error fetching users");
      }
    };

    fetchOrders();
    fetchUsers();
  }, []);

  // Find the order with the matching ID
  const selectedOrder = orders.find((order) => String(order.id) === orderId);

  useEffect(() => {
    if (selectedOrder) {
      setSelectedOrderEmail(selectedOrder?.user?.email || null); // Set the email from the selected order
    }
  }, [selectedOrder]);

  // After orders and allUsers are fetched, further filter users based on:
  // - urole (wholesaler or distributor), confirmed, not blocked.
  // - The user's city matches the order.address.city.
  // - The user has a quantity >= the quantity requested in the order.
  useEffect(() => {
    if (selectedOrder && allUsers.length > 0) {
      const orderCity = selectedOrder.address?.city || "";
      const requestedQuantity = selectedOrder.cart?.quantity || 0;
      const filteredUsers = allUsers.filter((user) => {
        return (
          (user.urole === "wholesaler" || user.urole === "distributor") &&
          user.confirmed === true &&
          user.blocked === false &&
          user.city === orderCity 
        );
      });
      setUsers(filteredUsers);
    }
  }, [selectedOrder, allUsers]);

  // Extract cart data from selectedOrder
  const cartData = selectedOrder?.cart ? {
    id: selectedOrder.cart.id,
    selectedCans: selectedOrder.cart.selectedCans,
    quantity: selectedOrder.cart.quantity
  } : null;

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-auto max-w-8xl">
          <p className="pt-12 pl-16 text-black text-[32px] font-semibold font-['Poppins'] ml-[200px]">
            Loading data...
          </p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="max-auto max-w-8xl">
          <p className="pt-12 pl-16 text-center text-red-500 text-[32px] font-semibold font-['Poppins']">
            Error: {error}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-auto max-w-8xl">
        <h1 className="pt-12 pl-16 text-black text-[32px] font-semibold font-['Poppins'] ml-[200px]">
          Manage Your All Orders
        </h1>
        {selectedOrder ? (
          <PendingCard order={selectedOrder} assigned={selectedUserId} />
        ) : (
          <p className="text-center text-red-500">Order not found.</p>
        )}

        {/* Pass filtered users, selected order's email, and cart data to OrderTable */}
        <OrderTable 
          data={users} 
          onSelectUser={handleSelectUser} 
          selectedOrderEmail={selectedOrderEmail} 
          order={selectedOrder}
        />
      </div>
      <div className="mb-12"></div>
      <Footer />
    </>
  );
};

export default Details;
