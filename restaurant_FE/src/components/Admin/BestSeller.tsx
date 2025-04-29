import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../css/AdminCss/BestSellers.module.css";

interface BestSellerDish {
  dishId: string;
  name: string;
  imageUrl?: string;
  price: number;
  totalQuantity: number;
}

const BestSellers: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<BestSellerDish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    limit: string;
    month: string;
    year: string;
  }>({
    limit: "5",
    month: "",
    year: new Date().getFullYear().toString(),
  });

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/dish/bestsellers", {
        params: {
          limit: filters.limit,
          month: filters.month || undefined,
          year: filters.year || undefined,
        },
      });
      setBestSellers(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load bestseller dishes!");
      setLoading(false);
      console.error("Error fetching bestsellers:", err);
    }
  };

  useEffect(() => {
    fetchBestSellers();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h3 className={styles.title}>Bestseller Dishes List</h3>
        <div className={styles.filters}>
          <div className={styles.filterItem}>
            <label htmlFor="limit">Limit:</label>
            <input
              type="number"
              id="limit"
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              min="1"
              className={styles.input}
              style={{width: '50px'}}
            />
          </div>
          <div className={styles.filterItem}>
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className={styles.select}
            >
              <option value="">All</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterItem}>
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className={styles.input}
              style={{width: '75px'}}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {bestSellers.length === 0 ? (
          <p className={styles.noData}>No dishes found for this period.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>No</th>
                <th className={styles.tableHeader}>Image</th>
                <th className={styles.tableHeader}>Dish Name</th>
                <th className={styles.tableHeader}>Total Sold</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((dish, index) => (
                <tr key={dish.dishId} className={styles.tableRow}>
                  <td className={styles.tableCell}>{index + 1}</td>
                  <td className={styles.tableCell}> <img
                    src={dish.imageUrl || "https://via.placeholder.com/50"}
                    alt={dish.name}
                    className={styles.tableImage}
                  /></td>
                  <td className={styles.tableCell}>
                    {dish.name}
                  </td>
                  <td className={styles.tableCell}>{dish.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BestSellers;