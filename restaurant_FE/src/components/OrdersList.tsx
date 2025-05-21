import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { HiX } from "react-icons/hi";
import { Trash2 } from "lucide-react";

interface User {
  _id: string;
  fullname: string;
}
interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
}
interface Booking {
  _id: string;
  tableId?: Table;
  orderType: string;
  bookingDate: string;
  status: string;
}
interface Dish {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}
interface Item {
  _id: string;
  bookingId: string;
  dishId: Dish;
  quantity: number;
}
interface Order {
  _id: string;
  userId?: User;
  bookingId?: Booking;
  totalAmount: number;
  prepaidAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  items?: Item[];
}
interface OrdersListProps {
  year: number;
  month: number;
  day: number;
  goBack: () => void;
}

const OrdersList: React.FC<OrdersListProps> = ({
  year,
  month,
  day,
  goBack,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  const [templates, setTemplates] = useState<
    { name: string; fields: string[] }[]
  >([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const allFields = [
    { key: "bookingDate", label: "Booking Date" },
    { key: "orderType", label: "Order Type" },
    { key: "status", label: "Status" },
    { key: "tableInfo", label: "Table Info" },
    { key: "prepaidAmount", label: "Prepaid Amount" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "createdAt", label: "Created At" },
  ];
  const [selectedFields, setSelectedFields] = useState<string[]>(
    allFields.map((field) => field.key)
  );
  useEffect(() => {
    fetchOrders();
  }, [year, month, day]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ orders: Order[] }>(
        `http://localhost:3000/api/revenue/${year}/${month}/${day}`
      );
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const response = await axios.get<{ data: Order }>(
        `http://localhost:3000/api/revenue/order/${orderId}`
      );
      setSelectedOrder(response.data.data);
      setIsModalOpen(true);

      setSelectedFields(allFields.map((field) => field.key));

      await loadTemplates();
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/revenue/templates"
      );
      setTemplates(res.data.templates);
    } catch (error) {
      console.error("Load error!", error);
    }
  };

  const handleSaveTemplate = async () => {
    const name = prompt("Enter template name: ");
    if (!name) return;
    try {
      await axios.post("http://localhost:3000/api/revenue/save", {
        name,
        fields: selectedFields,
      });
      alert("Saved successfully!");
      loadTemplates();
    } catch (error) {
      alert("Error!");
    }
  };

  const handleDeleteTemplate = async (name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mẫu "${name}" không?`))
      return;

    try {
      await axios.delete(
        `http://localhost:3000/api/revenue/deleteTemplate/${name}`
      );
      alert("Deleted!");
      setSelectedTemplate(null);
      await loadTemplates();
      setSelectedFields(allFields.map((f) => f.key));
    } catch (error) {
      alert("Error!");
    }
  };

  const handleApplyTemplate = (name: string) => {
    if (!name) {
      setSelectedTemplate(null);
      setSelectedFields(allFields.map((f) => f.key));
      return;
    }

    const template = templates.find((t) => t.name === name);
    if (template) {
      setSelectedTemplate(name);
      setSelectedFields(template.fields);
    }
  };

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handlePrintInvoice = async () => {
    if (!selectedOrder) return;
    setPrinting(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/revenue/printBill/${selectedOrder._id}`,
        { fields: selectedFields },
        { responseType: "text" }
      );
      const printWindow = window.open("", "_blank");
      printWindow?.document.write(response.data);
      printWindow?.document.close();
    } catch (error) {
      alert("Error!");
    }
    setPrinting(false);
  };
  return (
    <div className="mx-auto w-[90%] max-w-[1200px] my-5">
      <button
        className="bg-amber-400 hover:bg-amber-500 transition-colors duration-200 py-2 px-3 rounded-lg cursor-pointer"
        onClick={goBack}
      >
        Back
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md mt-5">
          <thead>
            <tr>
              <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                Order ID
              </th>
              <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                Customer
              </th>
              <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                Order Date
              </th>
              <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                Total Amount
              </th>
              <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="bg-white p-2.5 border border-gray-300 text-center">
                  {order._id}
                </td>
                <td className="bg-white p-2.5 border border-gray-300 text-center">
                  {order.userId?.fullname}
                </td>
                <td className="bg-white p-2.5 border border-gray-300 text-center">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="bg-white p-2.5 border border-gray-300 text-center">
                  {order.totalAmount.toLocaleString()} VND
                </td>
                <td className="bg-white p-2.5 border border-gray-300 text-center">
                  <button
                    className="bg-amber-400 hover:bg-amber-500 transition-colors duration-200 py-2 px-3 rounded-lg"
                    onClick={() => fetchOrderDetail(order._id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-10">
          <div className="bg-white p-5 rounded-lg w-[90%] max-w-[600px] relative max-h-[90vh] overflow-y-auto scrollbar-hide">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition"
              aria-label="Close"
            >
              <HiX className="text-2xl" />
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase border-b-2 border-amber-200 pb-1.5">
              🧾 Invoice
            </h2>

            <div className="space-y-2">
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Customer:</strong> {selectedOrder.userId?.fullname}
              </p>

              {allFields.map((field) => {
                let value: any = "";
                switch (field.key) {
                  case "bookingDate":
                    value =
                      selectedOrder.bookingId?.bookingDate &&
                      new Date(
                        selectedOrder.bookingId.bookingDate
                      ).toLocaleString();
                    break;
                  case "orderType":
                    value = selectedOrder.bookingId?.orderType;
                    break;
                  case "status":
                    value = selectedOrder.bookingId?.status;
                    break;
                  case "tableInfo":
                    const table = selectedOrder.bookingId?.tableId;
                    value = table
                      ? `${table.tableNumber} (Capacity: ${table.capacity})`
                      : "";
                    break;
                  case "prepaidAmount":
                    value = `${selectedOrder.prepaidAmount.toLocaleString()} VND`;
                    break;
                  case "paymentMethod":
                    value = selectedOrder.paymentMethod;
                    break;
                  case "paymentStatus":
                    value = selectedOrder.paymentStatus;
                    break;
                  case "createdAt":
                    value = new Date(selectedOrder.createdAt).toLocaleString();
                    break;
                }
                if (!value) return null;
                return (
                  <div
                    key={field.key}
                    className="flex justify-between items-center"
                  >
                    <span>
                      <strong>{field.label}:</strong> {value}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                    />
                  </div>
                );
              })}
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-700 text-left border-b-2 border-gray-300 pb-1.5"></h3>
            <table className="w-full border-collapse mt-2.5">
              <thead>
                <tr>
                  <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                    #
                  </th>
                  <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                    Dish
                  </th>
                  <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                    Qty
                  </th>
                  <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                    Unit Price
                  </th>
                  <th className="bg-amber-200 text-black font-bold p-2.5 border border-gray-300 text-center">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, i) => (
                  <tr key={item._id}>
                    <td className="p-2.5 border border-gray-300 text-center">
                      {i + 1}
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center">
                      {item.dishId.name}
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center">
                      {item.quantity}
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center">
                      {item.dishId.price.toLocaleString()}
                    </td>
                    <td className="p-2.5 border border-gray-300 text-center">
                      {(item.quantity * item.dishId.price).toLocaleString()} VND
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total right aligned */}
            <div className="text-right font-bold mt-2 text-red-600 text-lg">
              Total: {selectedOrder.totalAmount.toLocaleString()} VND
            </div>
            <div className="flex items-center mt-6 gap-10">
              {/* Select template button */}
              <div
                onClick={() => setIsTemplateSelectorOpen(true)}
                className="flex-1 cursor-pointer border border-gray-300 py-2.5 px-4 text-center rounded-lg hover:bg-gray-100 transition select-none truncate"
                title={
                  selectedTemplate
                    ? `Selected template: ${selectedTemplate}`
                    : "Click to select a template"
                }
              >
                {selectedTemplate
                  ? `Selected: ${selectedTemplate}`
                  : "Select Template"}
              </div>

              <button
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-2.5 px-4 rounded-lg text-base transition"
                onClick={handleSaveTemplate}
              >
                💾 Save template
              </button>
              <button
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-2.5 px-4 rounded-lg text-base transition disabled:opacity-50"
                onClick={handlePrintInvoice}
                disabled={printing}
              >
                {printing ? "Printing..." : "🖨️ Print Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTemplateSelectorOpen && (
        <div
          onClick={() => setIsTemplateSelectorOpen(false)}
          className="fixed inset-0 bg-black/30 z-[999]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-5 rounded-lg w-[80%] max-w-[800px] mx-auto mt-20 shadow-lg max-h-[70vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold">📋 Select a Template</h3>
            {templates.length === 0 ? (
              <p>No templates available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
                {/* Default template */}
                <div
                  className={`border ${
                    selectedTemplate === null
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  } rounded-lg p-3 cursor-pointer flex flex-col justify-between min-h-[100px]`}
                  onClick={() => {
                    handleApplyTemplate("");
                    setIsTemplateSelectorOpen(false);
                  }}
                >
                  <div className="font-bold mb-2">-- Default --</div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-300 text-gray-700 border-none rounded py-1 px-2 text-xs self-start cursor-not-allowed"
                    disabled
                  >
                    Cannot delete
                  </button>
                </div>

                {/* Saved templates */}
                {templates.map((template) => (
                  <div
                    key={template.name}
                    className={`border ${
                      selectedTemplate === template.name
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border border-gray-300 bg-gray-50"
                    } rounded-lg p-3 cursor-pointer flex flex-col justify-between min-h-[100px]`}
                    onClick={() => {
                      handleApplyTemplate(template.name);
                      setIsTemplateSelectorOpen(false);
                    }}
                  >
                    <div className="font-bold mb-2 text-center">
                      {template.name}
                    </div>

                    {/* Đặt button trong div căn giữa */}
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.name);
                        }}
                        className="flex items-center justify-center gap-1 bg-red-500 text-white border-none rounded px-3 py-1 text-xs hover:bg-red-600 transition"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
