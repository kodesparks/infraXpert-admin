import inventoryService from "@/services/inventoryService";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const OrderConfirmation = ({ order, handleConfirmOrder }) => {
    const [vendorData, setVendorData] = useState({
        vendorId: "",
        vendorEmail: "",
        vendorPhone: "",
        customEmail: "",
        customPhone: "",
        loadingCharges: "",
        items: [],
    });

    const [vendors, setVendorList] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    // Populate items from order object
    useEffect(() => {
        if (order?.items) {

            setVendorData((prev) => ({
                ...prev,
                items: order.items.map(item => ({
                    itemCode: item.itemCode._id,
                    name: item.itemCode.itemDescription,
                    qty: item.qty,
                    vendorUnitPrice: '',
                    vendorLoadingCharges: ''
                })),
            }));
            const fetchVendors = async () => {

                const res = await inventoryService.getVendors({ limit: 100 })
                setVendorList(res.vendors || [])
            }
            fetchVendors();
        }
    }, [order]);

    //   const selectedVendor = vendors.find(
    //     (v) => v._id === Number(vendorData.vendorId)
    //   );

    useEffect(() => {
        setSelectedVendor(vendors.find(
            (v) => v._id === vendorData.vendorId
        ));
    }, [vendors, vendorData.vendorId]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setVendorData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleItemPriceChange = (index, value) => {
        const updatedItems = [...vendorData.items];
        updatedItems[index].price = value;

        setVendorData((prev) => ({
            ...prev,
            items: updatedItems,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🔹 Validate Vendor Details
if (!vendorData.vendorId) {
  alert("Please select a vendor");
  return;
}

if (!vendorData.vendorEmail || (vendorData.vendorEmail === "other" && !vendorData.customEmail)) {
  alert("Please provide vendor email");
  return;
}

if (!vendorData.vendorPhone || (vendorData.vendorPhone === "other" && !vendorData.customPhone)) {
  alert("Please provide vendor phone");
  return;
}

// 🔹 Validate Item Prices
const invalidItem = vendorData.items.find(item => 
  !item.vendorUnitPrice || item.vendorUnitPrice === "" ||
  !item.vendorLoadingCharges || item.vendorLoadingCharges === ""
);

if (invalidItem) {
  alert(`Please enter unit price and loading charges for all items`);
  return;
}

// 🔹 Final Data
const finalData = {
  ...vendorData,
  vendorEmail:
    vendorData.vendorEmail === "other"
      ? vendorData.customEmail
      : vendorData.vendorEmail,
  vendorPhone:
    vendorData.vendorPhone === "other"
      ? vendorData.customPhone
      : vendorData.vendorPhone,
};

        console.log("Submitted Data:", finalData);
        handleConfirmOrder && handleConfirmOrder(finalData);
        // alert("Order Submitted Successfully");
    };

    return (
        <>
        <div className="max-w-5xl mx-auto space-y-6">

  {/* 🔹 ORDER ITEMS */}
  <div>
    <h4 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h4>

    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-right">Qty</th>
            <th className="px-4 py-2 text-right">Unit Price</th>
            <th className="px-4 py-2 text-right">Loading Charges</th>
            <th className="px-4 py-2 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {order?.items?.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-3 flex items-center gap-3">
                {item.itemCode?.primaryImage && (
                  <img
                    src={item.itemCode.primaryImage}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <span>{item.itemDescription || item.itemCode?.itemDescription}</span>
              </td>

              <td className="px-4 py-3">
                <Badge className="bg-blue-100 text-blue-800">
                  {item.category || item.itemCode?.category}
                </Badge>
              </td>

              <td className="px-4 py-3 text-right">{item.quantity || item.qty}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right">{formatCurrency(item.loadingCharges)}</td>
              <td className="px-4 py-3 text-right font-medium">
                {formatCurrency(item.totalPrice || item.totalCost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* 🔹 VENDOR DETAILS */}
  <div className="bg-white rounded-xl shadow-sm border p-5 mt-6">
  <h3 className="text-lg font-semibold mb-4">Vendor Details</h3>

  <div className="grid md:grid-cols-3 gap-4">

    {/* 🔹 Vendor */}
    <div>
      <label className="text-sm font-medium">Vendor</label>
      <select
        name="vendorId"
        value={vendorData.vendorId}
        onChange={handleChange}
        className="w-full border rounded-lg p-2 mt-1"
      >
        <option value="">Select Vendor</option>
        {vendors.map(v => (
          <option key={v._id} value={v._id}>{v.name}</option>
        ))}
      </select>
    </div>

    {/* 🔹 Email Dropdown */}
    {selectedVendor && (
      <div>
        <label className="text-sm font-medium">Email</label>

        <select
          name="vendorEmail"
          value={vendorData.vendorEmail}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
        >
          <option value="">Select Email</option>

          {/* Default vendor email */}
          {selectedVendor.email && (
            <option value={selectedVendor.email}>
              {selectedVendor.email}
            </option>
          )}

          <option value="other">Other</option>
        </select>

        {/* Custom Email Input */}
        {vendorData.vendorEmail === "other" && (
          <input
            type="email"
            name="customEmail"
            placeholder="Enter new email"
            value={vendorData.customEmail}
            onChange={handleChange}
            className="mt-2 w-full border rounded-lg p-2"
          />
        )}
      </div>
    )}

    {/* 🔹 Phone Dropdown */}
    {selectedVendor && (
      <div>
        <label className="text-sm font-medium">Phone</label>

        <select
          name="vendorPhone"
          value={vendorData.vendorPhone}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-1"
        >
          <option value="">Select Phone</option>

          {/* Default vendor phone */}
          {selectedVendor.phone && (
            <option value={selectedVendor.phone}>
              {selectedVendor.phone}
            </option>
          )}

          <option value="other">Other</option>
        </select>

        {/* Custom Phone Input */}
        {vendorData.vendorPhone === "other" && (
          <input
            type="tel"
            name="customPhone"
            placeholder="Enter new phone"
            value={vendorData.customPhone}
            onChange={handleChange}
            className="mt-2 w-full border rounded-lg p-2"
          />
        )}
      </div>
    )}

  </div>
</div>

  {/* 🔹 VENDOR PRICING */}
  <div className="bg-white rounded-xl shadow-sm border p-5">
    <h3 className="text-lg font-semibold mb-4">Vendor Pricing</h3>

    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Item</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Unit Price</th>
            <th className="px-3 py-2 text-right">Loading</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
  {vendorData.items.map((item, index) => {
    const total =
      (parseFloat(item.vendorUnitPrice || 0) +
        parseFloat(item.vendorLoadingCharges || 0)) *
              (item.qty || 0);

    return (
      <tr key={item.itemCode} className="border-t">
        <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2 text-right">{item.qty}</td>

        {/* ✅ Unit Price */}
        <td className="px-3 py-2">
          <Input
            value={item.vendorUnitPrice}
            onChange={(e) => {
              const value = e.target.value;
              if (/^(?:\d+|\d*\.\d+)?$/.test(value)) {
                const updated = [...vendorData.items];
                updated[index].vendorUnitPrice = value;
                setVendorData({ ...vendorData, items: updated });
              }
            }}
            className="text-right"
          />
        </td>

        {/* ✅ Loading Charges */}
        <td className="px-3 py-2">
          <Input
            value={item.vendorLoadingCharges}
            onChange={(e) => {
              const value = e.target.value;
              if (/^(?:\d+|\d*\.\d+)?$/.test(value)) {
                const updated = [...vendorData.items];
                updated[index].vendorLoadingCharges = value;
                setVendorData({ ...vendorData, items: updated });
              }
            }}
            className="text-right"
          />
        </td>

        {/* ✅ Total */}
        <td className="px-3 py-2 text-right font-medium">
          ₹ {total.toFixed(2)}
        </td>
      </tr>
    );
  })}
</tbody>
      </table>
    </div>
  </div>

  {/* 🔹 SUMMARY */}
  <div className="bg-gray-50 border rounded-xl p-4 flex justify-between items-center">
    <span className="text-lg font-medium">Total Amount</span>
    <span className="text-xl font-bold">
      ₹{" "}
      {vendorData.items
        .reduce((acc, item) => {
          return (
            acc +
            (parseFloat(item.vendorUnitPrice || 0) +
              parseFloat(item.vendorLoadingCharges || 0)) *
              (item.qty || 0)
          );
        }, 0)
        .toFixed(2)}
    </span>
  </div>

  {/* 🔹 SUBMIT BUTTON */}
  <div className="sticky bottom-0 bg-white border-t p-4">
    <button
      type="submit"
      onClick={handleSubmit}
      className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
    >
      Confirm Order
    </button>
  </div>

</div>
        </>
    );
};

export default OrderConfirmation;
