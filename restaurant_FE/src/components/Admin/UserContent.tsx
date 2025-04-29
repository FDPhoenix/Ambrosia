import { useState, useEffect } from 'react';
import { FaUserEdit, FaTimes, FaUnlock, FaLock } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import styles from '../../css/AdminCss/UserContent.module.css';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <p>{message}</p>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm} className={styles.modalButton}>OK</button>
          <button onClick={onCancel} className={styles.modalButton}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

function UserContent() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    rankName: "Bronze",
    isActive: "Ban",
    image: "",
  });

  const [confirmData, setConfirmData] = useState({
    isVisible: false,
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const hasTooManySpaces = (str: string) => /\s{2,}/.test(str);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle editing user
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setNewUser({ ...user });
    setShowForm(true);
  };

  const handleHideUser = (id: any) => {
    const currentUser = users.find((user: any) => user.id === id);
    const confirmMessage = currentUser.isActive === true
      ? "Do you want to Ban this user?"
      : "Do you want to Unban this user?";

    setConfirmData({
      isVisible: true,
      message: confirmMessage,
      onConfirm: async () => {
        setConfirmData(prev => ({ ...prev, isVisible: false }));
        try {
          const response = await fetch(`http://localhost:3000/user/ban/${id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${Cookies.get('token')}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          if (response.ok) {
            toast.success(data.message);
            fetchUsers();
            setUsers(users.map((user) =>
              user.id === id ? { ...user, status: user.status === "Ban" ? "UnBan" : "Ban" } : user
            ));
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Error toggling user status:", error);
        }
      },
      onCancel: () => {
        setConfirmData(prev => ({ ...prev, isVisible: false }));
      }
    });
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: { target: { files: any[]; }; }) => {
    const file = e.target.files[0];
    console.log("File selected:", file);

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, JPEG)');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size is too large. Please upload an image smaller than 5MB.');
        return;
      }

      const imageUrl = URL.createObjectURL(file);

      setNewUser({ ...newUser, image: imageUrl, file: file });
    }
  };


  const handleAddOrUpdateUser = async () => {
    const confirmChange = window.confirm("Do you want to change user information?");
    if (confirmChange) {
      const formData = new FormData();

      if (newUser.fullname !== editingUser.fullname) formData.append('fullname', newUser.fullname);
      if (newUser.email !== editingUser.email) formData.append('email', newUser.email);
      if (newUser.phoneNumber !== editingUser.phoneNumber) formData.append('phoneNumber', newUser.phoneNumber);

      if (newUser.file) {
        formData.append('profileImage', newUser.file);
      }

      if (formData.entries().next().done) {
        alert("No changes to update.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/user/edit/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          toast.success("User updated successfully!");

          setShowForm(false);
          fetchUsers();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error saving user:", error);
        alert("There was an error updating the user. Please try again.");
      }
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("There was an error fetching users. Please try again.");
    }
  };

  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentTitle}>
        <h3>List of User</h3>
      </div>

      <div className={styles.mainContent}>
        <table className={styles.dishTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Image</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Rank</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td><img src={user.profileImage} alt={user.fullname} className={styles.dishImage} /></td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>
                  <div style={{ width: '106px', margin: '0 auto' }}>
                    <StatusBadge status={user.isActive} caseTrue={"Active"} caseFalse={"Banned"} />
                  </div>
                </td>
                <td>{user.rank.rankName}</td>
                <td>
                  <button className={styles.actionButton} style={{ marginRight: '10px' }} onClick={() => handleEditUser(user)}>
                    <FaUserEdit />
                  </button>
                  <button className={styles.actionButton} onClick={() => handleHideUser(user.id)}>
                    {user.isActive === true ? <FaLock /> : <FaUnlock />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
              <button onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <div className={styles.formContent}>
              <div className={styles.imageUpload}>
                {newUser.image ? <img src={newUser.image} alt="Preview" /> : <span>Select Image</span>}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <div className={styles.formFields}>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  value={newUser.fullname}
                  onChange={handleInputChange}
                />
                {newUser.fullname === "" && (
                  <span className={styles.error}>Full Name is required</span>
                )}
                {newUser.fullname && newUser.fullname.length > 50 && (
                  <span className={styles.error}>Full Name cannot exceed 50 characters</span>
                )}
                {newUser.fullname && hasTooManySpaces(newUser.fullname) && (
                  <span className={styles.error}>
                    Full Name cannot contain more than 1 consecutive space
                  </span>
                )}

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={handleInputChange}
                />
                {newUser.email === "" && (
                  <span className={styles.error}>Email is required</span>
                )}
                {newUser.email && newUser.email.length > 50 && (
                  <span className={styles.error}>Email cannot exceed 50 characters</span>
                )}
                {newUser.email && !/\S+@\S+\.\S+/.test(newUser.email) && (
                  <span className={styles.error}>Please enter a valid email address</span>
                )}
                {newUser.email && hasTooManySpaces(newUser.email.trim()) && (
                  <span className={styles.error}>
                    Email cannot contain more than 1 consecutive space
                  </span>
                )}

                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={newUser.phoneNumber}
                  onChange={handleInputChange}
                />
                {newUser.phoneNumber === "" && (
                  <span className={styles.error}>Phone Number is required</span>
                )}
                {newUser.phoneNumber && newUser.phoneNumber.length > 50 && (
                  <span className={styles.error}>Phone Number cannot exceed 50 characters</span>
                )}
                {newUser.phoneNumber && !/^\d{10}$/.test(newUser.phoneNumber) && (
                  <span className={styles.error}>
                    Please enter a valid 10-digit phone number
                  </span>
                )}
                {newUser.phoneNumber && hasTooManySpaces(newUser.phoneNumber) && (
                  <span className={styles.error}>
                    Phone Number cannot contain more than 1 consecutive space
                  </span>
                )}

                <input type="text" name="rankName" value={newUser.rankName} readOnly placeholder="Rank (Fixed)" />

                <button
                  onClick={handleAddOrUpdateUser}
                  className={styles.addIconButton}
                  disabled={
                    newUser.fullname === "" ||
                    newUser.email === "" ||
                    newUser.phoneNumber === "" ||
                    newUser.fullname.length > 50 ||
                    newUser.email.length > 50 ||
                    newUser.phoneNumber.length > 50 ||
                    hasTooManySpaces(newUser.fullname) ||
                    hasTooManySpaces(newUser.email.trim()) ||
                    hasTooManySpaces(newUser.phoneNumber) ||
                    !/\S+@\S+\.\S+/.test(newUser.email) ||
                    !/^\d{10}$/.test(newUser.phoneNumber)
                  }
                >
                  <FaUserEdit size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmData.isVisible && (
        <ConfirmModal
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={confirmData.onCancel}
        />
      )}
    </div>
  );
}

export default UserContent;
