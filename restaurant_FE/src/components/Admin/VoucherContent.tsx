import { useEffect, useState } from 'react'
import styles from '../../css/AdminCss/VoucherContent.module.css'
import { toast } from 'react-toastify';
import { FaEdit, FaTimes } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import { faL } from '@fortawesome/free-solid-svg-icons';

function VoucherContent() {
  const [voucher, setVoucher] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editVoucher, setEditVoucher] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    expiresAt: '',
    isUsed: false,
  });


  const fetchVoucher = () => {
    fetch("http://localhost:3000/vouchers")
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setVoucher(response.data);
          console.log("Voucher: ", response.data);
        } else {
          toast.error(response.message);
        }
      })
      .catch((err) => {
        console.error("Error fetching voucher:", err);
      });
  }

  useEffect(() => {
    fetchVoucher();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'isUsed') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === 'true',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = editVoucher ? 'PUT' : 'POST';
    const url = editVoucher
      ? `http://localhost:3000/vouchers/${editVoucher._id}`
      : 'http://localhost:3000/vouchers';

    if (!formData.code || !formData.discount || !formData.expiresAt) {
      toast.error("Mising required field")
      setLoading(false)
      return;
    }

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: formData.code,
        discount: Number(formData.discount),
        expiresAt: formData.expiresAt,
        isUsed: formData.isUsed,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          toast.success(editVoucher ? 'Voucher updated successfully!' : 'Voucher added successfully!');
          fetchVoucher();
          setShowForm(false);
          setEditVoucher(null);
          setFormData({ code: '', discount: '', expiresAt: '', isUsed: false });
        } else {
          toast.error(response.message);
        }
      })
      .catch((err) => {
        console.error('Error:', err);
        toast.error('Error, please try again!');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEdit = (voucher: any) => {
    setEditVoucher(voucher);
    setFormData({
      code: voucher.code,
      discount: voucher.discount.toString(),
      expiresAt: new Date(voucher.expiresAt).toISOString().split('T')[0],
      isUsed: voucher.isUsed,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditVoucher(null);
    setFormData({ code: '', discount: '', expiresAt: '', isUsed: false });
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentTitle}>
        <h3>List of Voucher</h3>
        <button onClick={() => setShowForm(true)}>Add voucher</button>
      </div>

      <div className={styles.mainContent}>
        <table className={styles.voucherTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Code</th>
              <th>Discount (%)</th>
              <th>Expires Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {voucher.map((voucher: any, index) => (
              <tr key={voucher._id}>
                <td>{index + 1}</td>
                <td>{voucher.code}</td>
                <td>{voucher.discount}</td>
                <td>{new Date(voucher.expiresAt).toISOString().split('T')[0]}</td>
                <td>
                  <div style={{ width: '106px', margin: '0 auto' }}>
                    <StatusBadge status={!voucher.isUsed} caseTrue={"Available"} caseFalse={"Unavailable"} />
                  </div>
                </td>
                <td>
                  <button className={styles.actionButton}
                    style={{ marginRight: '10px' }}
                    onClick={() => handleEdit(voucher)}
                  >
                    <FaEdit />
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
              <h3>{editVoucher ? 'Edit Voucher' : 'Add New Voucher'}</h3>
              <button onClick={handleCloseForm}><FaTimes /></button>
            </div>

            <div className={styles.formContent}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formFields}>
                  <label htmlFor="code">Voucher code</label>
                  <input
                    type="text"
                    name="code"
                    id='code'
                    value={formData.code}
                    onChange={handleInputChange}
                  />

                  <label htmlFor="discount">Discount</label>
                  <input
                    className={styles.noSpinner}
                    type="number"
                    name="discount"
                    id="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />

                  {editVoucher ? (
                    <div>
                      <label htmlFor="isUsed">Status</label>
                      <select
                        name="isUsed"
                        id="isUsed"
                        value={formData.isUsed.toString()}
                        onChange={handleInputChange}
                        style={{ padding: '12px', width: '100%' }}
                      >
                        <option value="false">Available</option>
                        <option value="true">Unavailable</option>
                      </select>
                    </div>
                  ) : (null)}

                  <label htmlFor="expiresAt">Expires Time</label>
                  <input
                    type="date"
                    name="expiresAt"
                    id="expiresAt"
                    style={{ padding: '12px' }}
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                  />

                  <button type="submit" disabled={loading}>
                    {loading
                      ? editVoucher
                        ? 'Editing...'
                        : 'Adding...'
                      : editVoucher
                        ? 'Edit Voucher'
                        : 'Add Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoucherContent