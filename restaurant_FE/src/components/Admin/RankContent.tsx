import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from '../../css/AdminCss/RankContent.module.css';
import { FaEdit } from "react-icons/fa";

interface Rank {
    _id: string;
    rankName: string;
    minSpending: number;
    benefits: string;
    totalSpending: number;
}

const ManageRank: React.FC = () => {
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingRank, setEditingRank] = useState<Rank | null>(null);
    const [formData, setFormData] = useState<Omit<Rank, "_id" | "totalSpending">>({ rankName: "", minSpending: 0, benefits: "" });

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        try {
            const response = await axios.get<Rank[]>("http://localhost:3000/rank/all");
            setRanks(response.data);
        } catch (error) {
            console.error("Error fetching ranks", error);
        }
    };

    const openModal = (rank: Rank | null = null) => {
        setEditingRank(rank);
        setFormData(rank ? { rankName: rank.rankName, minSpending: rank.minSpending, benefits: rank.benefits } : { rankName: "", minSpending: 0, benefits: "" });
        setModalOpen(true);
    };

    const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
        let { name, value } = e.target;

        if (name === "rankName") {
            value = value.replace(/[^A-Za-z]/g, "");
        }

        if (name === "benefits") {
            value = value.replace(/\s/g, "");
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRank) {
                await axios.put(`http://localhost:3000/rank/${editingRank._id}`, formData);
            } else {
                await axios.post("http://localhost:3000/rank/add", formData);
            }
            fetchRanks();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving rank", error);
        }
    };

    return (
        <div className={styles.manageRankContainer}>
            <div className={styles.contentTitle}>
                <h3>List of Rank</h3>
                <button className={styles.createBtn} onClick={() => openModal()}>Add Rank</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Rank Name</th>
                        <th>Min Spending (VND)</th>
                        <th>Benefits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ranks.map((rank, index) => (
                        <tr key={rank._id}>
                            <td>{index + 1}</td>
                            <td>{rank.rankName}</td>
                            <td>{rank.minSpending.toLocaleString()}</td>
                            <td>{rank.benefits}</td>
                            <td>
                                <FaEdit className={styles.editIcon} onClick={() => openModal(rank)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingRank ? "Edit Rank" : "Create New Rank"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="rankName" placeholder="Rank Name" value={formData.rankName} onChange={handleChange} required />
                            <input type="number" name="minSpending" placeholder="Min Spending" value={formData.minSpending} onChange={handleChange} required />
                            <textarea name="benefits" placeholder="Benefits" value={formData.benefits} onChange={handleChange} required />
                            <div className={styles.modalButtons}>
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRank;
