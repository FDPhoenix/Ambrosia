import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaEdit, FaTrash, FaSort } from "react-icons/fa";
import styles from "../../css/AdminCss/TableContent.module.css";

// Định nghĩa kiểu dữ liệu cho bàn
interface Table {
  tableNumber: string;
  capacity: number | "";
}

const TableContent: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [customTable, setCustomTable] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"tableNumber" | "capacity" | null>(null);  // Lưu cột đang sắp xếp
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Hướng sắp xếp (tăng / giảm)


  useEffect(() => {
    fetchTables();
    fetchAvailableTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/tables");
      if (response.data.success) {
        setTables(response.data.tables);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchAvailableTables = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/tables/available-numbers");
      if (response.data.success) {
        setAvailableTables(response.data.availableTables);
      }
    } catch (error) {
      console.error("Error fetching available tables:", error);
    }
  };

  const handleSort = (column: "tableNumber" | "capacity") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Nếu đã chọn cột này, đảo hướng sắp xếp
    } else {
      setSortBy(column);  // Chọn cột mới
      setSortOrder("asc"); // Mặc định sắp xếp tăng dần khi chọn cột mới
    }
  };

  const sortedTables = [...tables].sort((a, b) => {
    if (!sortBy) return 0; // Nếu chưa chọn cột nào, không sắp xếp
    if (sortBy === "tableNumber") return sortOrder === "asc" ? a.tableNumber.localeCompare(b.tableNumber) : b.tableNumber.localeCompare(a.tableNumber);
    if (sortBy === "capacity") return sortOrder === "asc" ? Number(a.capacity) - Number(b.capacity) : Number(b.capacity) - Number(a.capacity);
    return 0;
  });


  const handleAddTable = async () => {
    const finalTableNumber = customTable || tableNumber;
    if (!finalTableNumber || capacity === "") return toast.warn("Please fill in all required fields!");

    try {
      const response = await axios.post("http://localhost:3000/api/tables", {
        tableNumber: finalTableNumber,
        capacity,
      });

      if (response.data.success) {
        toast.success("Table added successfully!");
        fetchTables();
        fetchAvailableTables();
        setIsAddModalOpen(false);
        setTableNumber("");
        setCustomTable("");
        setCapacity("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding table:", error);
      toast.error("Error adding table!");
    }
  };

  const handleUpdateTable = async () => {
    if (!selectedTable) return;
    try {
      const response = await axios.put(`http://localhost:3000/api/tables/${selectedTable.tableNumber}`, {
        capacity: selectedTable.capacity,
      });

      if (response.data.success) {
        toast.success("Bàn đã được cập nhật!");
        fetchTables();
        setIsUpdateModalOpen(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating table:", error);
      toast.error("Error updating table!");
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setTableNumber("");  // Reset dropdown
    setCustomTable("");  // Reset input nhập bàn
    setCapacity("");     // Reset input số lượng ghế
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);

    // Reset selectedTable to its original state
    setSelectedTable(null);
  };

  const handleDeleteTable = async (tableNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete table ${tableNumber}?`)) return;

    try {
      const response = await axios.delete(`http://localhost:3000/api/tables/${tableNumber}`);

      if (response.data.success) {
        toast.success("Table deleted successfully!");
        fetchTables();
        fetchAvailableTables();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Error deleting table!");
    }
  };
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerContainer}>
        <h2>Table List</h2>
        <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
          Add table
        </button>
      </div>

      <div className={styles.formContent}>
        {/* Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th onClick={() => handleSort("tableNumber")} className={styles.sortable}>
                <FaSort /> Table Name
              </th>
              <th onClick={() => handleSort("capacity")} className={styles.sortable}>
                <span className={styles.FaSort}><FaSort /></span>  Number of seats
              </th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {sortedTables.map((table, index) => (
              <tr key={table.tableNumber}>
                <td>{index + 1}</td>
                <td>{table.tableNumber}</td>
                <td>{table.capacity}</td>
                <td>
                  <div className={styles.buttonContainer}>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => { setSelectedTable(table); setIsUpdateModalOpen(true); }}
                    >
                      <FaEdit className={styles.actionIcon} /> Edit
                    </button>
                  </div>
                </td>
                <td>
                  <div className={styles.buttonContainer}>
                    <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteTable(table.tableNumber)}>
                      <FaTrash className={styles.actionIcon} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Modal Thêm Bàn */}
      <Modal isOpen={isAddModalOpen} onRequestClose={handleCloseAddModal} className={styles.modal}>
        <div className={styles.content}>
          <h3 className={styles.modalHeader}>Add Table</h3>
          <label>Select an available table number:</label>
          <select value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} disabled={customTable !== ""}>
            <option value="">-- Select a table --</option>
            {availableTables.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>

          <label>Or enter a new table number:</label>
          <input type="text" value={customTable} onChange={(e) => setCustomTable(e.target.value)} disabled={tableNumber !== ""} />


          <label>Number of seats:</label>
          <input
            type="number"
            value={capacity === "" ? "" : Number(capacity)}  // Không hiển thị số 0 phía trước
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setCapacity(""); // Cho phép nhập trống nhưng không hiện số 0
              } else {
                const num = Number(value);

                if (num < 1) {
                  toast.warn("Minimum number of seats is 1!");
                  setCapacity(1);
                } else if (num > 20) {
                  toast.warn("Maximum number of seats is 20!");
                  setCapacity(20);
                } else {
                  setCapacity(num);
                }
              }
            }}
            min="1" max="20"
            required
          />


          <div className={styles.modalButtons}>
            <button className={styles.saveButton} onClick={handleAddTable}>Add</button>
            <button className={styles.cancelButton} onClick={handleCloseAddModal}>Close</button>
          </div>
        </div>
      </Modal>


      {/* Modal Cập Nhật Bàn */}
      <Modal isOpen={isUpdateModalOpen} onRequestClose={() => setIsUpdateModalOpen(false)} className={styles.modal}>
        <div className={styles.content}>
          <h3 className={styles.modalHeader}>Update Table {selectedTable?.tableNumber}</h3>
          <label>Number of seats:</label>
          <input
            type="number"
            value={selectedTable?.capacity !== undefined ? selectedTable.capacity : ""} // Prevents undefined issues
            onChange={(e) => {
              if (!selectedTable) return;

              const value = e.target.value.trim(); // Remove spaces

              if (value === "") {
                setSelectedTable({ ...selectedTable, capacity: "" }); // Set empty string instead of undefined
              } else {
                const num = Number(value);

                if (isNaN(num)) return;

                if (num < 1) {
                  toast.warn("Minimum number of seats is 1!");
                  setSelectedTable({ ...selectedTable, capacity: 1 });
                } else if (num > 20) {
                  toast.warn("Số lượng ghế tối đa là 20!");
                  setSelectedTable({ ...selectedTable, capacity: 20 });
                } else {
                  setSelectedTable({ ...selectedTable, capacity: num });
                }
              }
            }}
            min="1" max="20"
            required
          />

          <div className={styles.modalButtons}>
            <button className={styles.saveButton} onClick={handleUpdateTable}>Update</button>
            <button className={styles.cancelButton} onClick={handleCloseUpdateModal}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableContent;
