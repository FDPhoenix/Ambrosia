import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import styles from "../../css/AdminCss/EmployeeContent.module.css";
import { FaUserSlash, FaUserCheck, FaEdit, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StatusBadge from "./StatusBadge";
import { AxiosError } from 'axios';

interface Employee {
  _id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  isActive: boolean;
}

export default function EmployeeContext() {
  const [activeTab, setActiveTab] = useState<"staff" | "chef">("staff");
  const [staffs, setStaffs] = useState<Employee[]>([]);
  const [chefs, setChefs] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Modal Add Employee
  const [newEmployee, setNewEmployee] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    // profileImage: "",
    password: "",
    confirmPassword: "",
  });
  // Modal Edit Employee
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);


  useEffect(() => {
    fetchEmployees("staff");
    fetchEmployees("chef");
  }, [activeTab]);

  const fetchEmployees = async (role: "staff" | "chef") => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/employees/get${role === "staff" ? "Staff" : "Chef"}`);
      if (role === "staff") setStaffs(response.data.employees);
      else setChefs(response.data.employees);
    } catch (error) {
      console.error(`Error fetching ${role} employees:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/employees/getEmployee/${id}`);
      if (!response.data.user) {
        console.error("No employee data found");
        return;
      }
      setEditingEmployee(response.data.user);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const handleSaveChanges = async () => {
    if (!editingEmployee) return;
    try {
      await axios.put(`http://localhost:3000/api/employees/update/${editingEmployee._id}`, editingEmployee);
      setIsEditModalOpen(false);
      fetchEmployees(activeTab);
      toast.success("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee!");
    }
  };

  const toggleBanUnban = async (id: string, currentStatus: boolean) => {
    try {
      await axios.put(`http://localhost:3000/api/employees/update/${id}`, { isActive: !currentStatus });
      fetchEmployees(activeTab);
      toast.success(`Account has been ${currentStatus ? "banned" : "unbanned"}!`);
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast.error("Failed to update employee status!");
    }
  };

   const handleAddEmployee = async () => {
    if (!newEmployee.fullname || !newEmployee.email || !newEmployee.password || !newEmployee.phoneNumber) {
      toast.warn("Please fill in all fields!");
      return;
    }

    if (newEmployee.password !== newEmployee.confirmPassword) {
      toast.warn("Passwords do not match!!");
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/employees/add${activeTab === "staff" ? "Staff" : "Chef"}`, newEmployee);
      setNewEmployee({ fullname: "", email: "", phoneNumber: "", password: "", confirmPassword: "" });
      fetchEmployees(activeTab);
      setModalIsOpen(false);
      toast.success("Employee added successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error adding employee:", error.response);

        if (error.response && error.response.data) {
          if (error.response.data.message === "Email is already registered.") {
            toast.warn("This email is already registered.");
          } else {
            toast.error(`Error: ${error.response.data.message || "Failed to add employee!"}`);
          }
        } else {
          toast.error("An unexpected error occurred!");
        }
      } else {
        toast.error("An unexpected error occurred!");
      }
    }
  };

  const employees = activeTab === "staff" ? staffs : chefs;

  return (
    <div className={styles.container}>
      {/* Tabs */}
      <ul className={styles.navTabs}>
        <li className={styles.navItem}>
          <button
            className={`${styles.navLink} ${activeTab === "staff" ? styles.active : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            Staff
          </button>
        </li>
        <li className={styles.navItem}>
          <button
            className={`${styles.navLink} ${activeTab === "chef" ? styles.active : ""}`}
            onClick={() => setActiveTab("chef")}
          >
            Chef
          </button>
        </li>
      </ul>

      {/* Header Container */}
      <div className={styles.headerContainer}>
        <h3>{activeTab === "staff" ? "Staff List" : "Chef List"}</h3>
        <button className={styles.addButton} onClick={() => setModalIsOpen(true)}>
          {activeTab === "staff" ? "Add staff" : "Add chef"}
        </button>
      </div>

      {/* Modal thêm nhân viên */}
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className={styles.modal}>
        <div className={styles.content}>
          <h3 className={styles.modalHeader}>Add {activeTab === "staff" ? "Staff" : "Chef"}</h3>

          <label>Full Name</label>
          <input type="text" className={styles.input} placeholder="Full Name"
            value={newEmployee.fullname}
            onChange={(e) => setNewEmployee({ ...newEmployee, fullname: e.target.value })} required />

          <label>Email</label>
          <input type="email" placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} required />

          <label>Phone Number</label>
          <input type="text" placeholder="Phone Number"
            value={newEmployee.phoneNumber}
            onChange={(e) => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })} required />

          <label>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
              required
            />
            <button type="button" className={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <label>Confirm Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={newEmployee.confirmPassword}
              onChange={(e) => setNewEmployee({ ...newEmployee, confirmPassword: e.target.value })}
              required
            />
            <button type="button" className={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div className={styles.modalButtons}>
            <button className={styles.saveButton} onClick={handleAddEmployee}>Create</button>
            <button className={styles.cancelButton} onClick={() => setModalIsOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Modal Edit Employee */}
      <Modal isOpen={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)} className={styles.modal}>
        <div className={styles.content}>
          <h3 className={styles.modalHeader}>Edit {activeTab === "staff" ? "Staff" : "Chef"} Details</h3>

          <label>Full Name</label>
          <input type="text" value={editingEmployee?.fullname || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee!, fullname: e.target.value })} />

          <label>Email</label>
          <input type="email" value={editingEmployee?.email || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee!, email: e.target.value })} />

          <label>Phone Number</label>
          <input type="text" value={editingEmployee?.phoneNumber || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee!, phoneNumber: e.target.value })} />

          <div className={styles.modalButtons}>
            <button className={styles.saveButton} onClick={handleSaveChanges}>Save Changes</button>
            <button className={styles.cancelButton} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Danh sách nhân viên */}
      <div className={styles.formContent}>
        <div className="tab-content mt-3">
          {loading ? (
            <div className="loading text-center">Loading...</div>
          ) : employees.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th> {/* Số thứ tự */}
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th >Ban</th>
                  <th>Edit</th>
                  {/* <th>Delete</th> */}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={employee._id}>
                    <td data-label="#">{index + 1}</td> {/* Hiển thị số thứ tự */}
                    <td data-label="Full Name">{employee.fullname}</td>
                    <td data-label="Email">{employee.email}</td>
                    <td data-label="Phone">{employee.phoneNumber}</td>
                    <td data-label="Status"><StatusBadge status={employee.isActive} caseTrue={"Active"} caseFalse={"Banned"}/></td>
                    <td>
                      {/* Ban/Unban Button */}
                      <div className={styles.buttonContainer}>
                        <button
                          className={`${styles.actionButton} ${employee.isActive ? styles.banButton : styles.unbanButton}`}
                          onClick={() => toggleBanUnban(employee._id, employee.isActive)}
                        >
                          {employee.isActive ? <FaUserSlash className={styles.actionIcon} /> : <FaUserCheck className={styles.actionIcon} />}
                          {employee.isActive ? "Ban" : "Unban"}
                        </button>
                      </div>
                    </td>
                    <td>
                      {/* Edit Button */}
                      <div className={styles.buttonContainer}>
                        <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleEditEmployee(employee._id)}>
                          <FaEdit className={styles.actionIcon} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : (
            <div className="alert-danger text-center">No employees available.</div>
          )}
        </div></div>
    </div>
  );
}
