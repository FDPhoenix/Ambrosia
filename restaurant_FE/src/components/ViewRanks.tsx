import React, { useEffect, useState } from "react";
import styles from "../css/ViewRanks.module.css";
import Cookies from "js-cookie";

interface RankData {
    _id: string;
    rankName: string;
    minSpending: number;
    benefits?: string;
}

interface VoucherData {
    _id: string;
    code: string;
    discount: number;
    isUsed: boolean;
}

interface UserRankResponse {
    success: boolean;
    message: string;
    totalSpending: number;
    rank: RankData | null;
    voucher: VoucherData | string;
}

const ViewRanks: React.FC = () => {
    const [rank, setRank] = useState<RankData | null>(null);
    const [totalSpending, setTotalSpending] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showBanner, setShowBanner] = useState<boolean>(false);
    const [voucher, setVoucher] = useState<VoucherData | string>("No available voucher");

    const fetchUserRank = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("token");
            const response = await fetch("http://localhost:3000/rank", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Error fetching rank: ${response.statusText}`);

            const data: UserRankResponse = await response.json();
            if (data.success) {
                const previousRank = Cookies.get("previousRank");
                setRank(data.rank);
                setTotalSpending(data.totalSpending);
                setVoucher(data.voucher);

                if (data.rank && data.rank.rankName !== previousRank) {
                    setShowBanner(true);
                    Cookies.set("previousRank", data.rank.rankName);
                }
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserRank();
    }, []);

    if (loading) return <div>Loading rank...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            {showBanner && rank && (
                <div className={styles.banner}>
                    <p>🎉 Congratulations! You have just reached the rank of <strong>{rank.rankName}</strong> 🎉</p>
                    <button
                        className={styles.viewBenefitsButton}
                        onClick={() => alert(`Voucher for rank ${rank.rankName}: ${typeof voucher === "string" ? voucher : `${voucher.code}: -${voucher.discount}%`}`)}
                    >
                        View Voucher
                    </button>
                    <button className={styles.closeBanner} onClick={() => setShowBanner(false)}>X</button>
                </div>
            )}

            <h2 className={styles.heading}>Your Rank</h2>
            <div className={styles.rankDetails}>
                <div className={styles.rankItem}>
                    <span className={styles.label}>Rank Name:</span>
                    <span className={styles.value}>{rank ? rank.rankName : "No Rank"}</span>
                </div>
                <div className={styles.rankItem}>
                    <span className={styles.label}>Min Spending:</span>
                    <span className={styles.value}>{rank ? rank.minSpending : "N/A"}</span>
                </div>
                <div className={styles.rankItem}>
                    <span className={styles.label}>Benefits:</span>
                    <span className={styles.value}>{rank?.benefits || "None"}</span>
                </div>
                <div className={styles.rankItem}>
                    <span className={styles.label}>Total Spending:</span>
                    <span className={styles.value}>{totalSpending.toLocaleString()}</span>
                </div>
                <div className={styles.rankItem}>
                    <span className={styles.label}>Voucher:</span>
                    <span className={styles.value}>{typeof voucher === "string" ? voucher : `${voucher.code}: -${voucher.discount}%`}</span>
                </div>
            </div>
        </div>
    );
};

export default ViewRanks;