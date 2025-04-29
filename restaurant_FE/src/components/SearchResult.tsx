import { Link, useLocation } from 'react-router'
import styles from '../css/SearchResult.module.css'
import { useEffect, useState } from 'react';
import { FaCartPlus } from 'react-icons/fa';

function SearchResult() {
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const name = params.get("name");

    useEffect(() => {
        if (!name) return;

        fetch(`http://localhost:3000/dishes?name=${name}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setResults(data.dishes);
                } else {
                    setResults([]);
                    setError(data.message);
                }
            })
            .catch((err) => {
                console.error(err);

                setError("Failed to fetch data.");
            });
    }, [name]);

    return (
        <div className={styles.container}>
            <div className={styles.result}>
                <h2 className={styles.resultHeader}>Searching result for "{name}"</h2>

                {results.length > 0 ? (
                    <div className={styles.resultContainer}>
                        {results.map((item) => (
                            <Link key={item._id} to={`/dish/${item._id}`} className={styles.link}>
                                <div className={styles.menuCard}>
                                    <div className={styles.dishThumbnail}>
                                        <img className={styles.imageUrl} src={item.imageUrl} alt='' />
                                    </div>

                                    <div className={styles.dishDescription}>
                                        <p className={styles.name}>{item.name}</p>
                                        <p className={styles.price}>{item.price.toLocaleString()}₫</p>
                                    </div>

                                    <button className={styles.addCartBtn}>
                                        <FaCartPlus className={styles.addCartIcon} />
                                        <p className={styles.addTitle}>Add to cart</p>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (error && <p className={styles.error}>{error}</p>)}
            </div>
        </div>
    );
}

export default SearchResult
