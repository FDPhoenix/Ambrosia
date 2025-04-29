import { Image } from 'react-bootstrap'
import styles from '../css/AboutDetail.module.css'
import img1 from '../assets/spain-appetizer.jpg'
import img2 from '../assets/wine-and-cheese.jpg'
import img3 from '../assets/cups-of-coffee.jpg'
import chef from '../assets/Chef-image.jpg'
import food from '../assets/our-repcei.jpg'

function AboutDetail() {
    return (
        <div>
            <section className={styles.storySection}>
                <div className={styles.sectionTag}>TASTY AND CRUNCHY</div>
                <h2 className={styles.sectionTitle}>Our Story</h2>
                <p className={styles.sectionText}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore nisi ut
                    aliquip ex ea commodo consequat. consectetur adipiscing elitst aliquip.
                </p>

                <div className={styles.foodGrid}>
                    <div className={styles.foodCard}>
                        <div className={styles.foodImage}>
                            <Image
                                src={img1}
                                alt="Spain Appetizer"
                                width={300}
                                height={250}
                                className={styles.image}
                            />
                        </div>
                        <h3 className={styles.foodTitle}>Spain Appetizer</h3>
                        <p className={styles.foodDescription}>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptate, cuaeruntum doloremque laudantium, totam rem
                            aperiam per spiciatis unde omnis iste natus.
                        </p>
                        <a href="#" className={styles.readMore}>
                            READ MORE
                        </a>
                    </div>

                    <div className={styles.foodCard}>
                        <div className={styles.foodImage}>
                            <Image
                                src={img2}
                                alt="Wine and Cheese"
                                width={300}
                                height={250}
                                className={styles.image}
                            />
                        </div>
                        <h3 className={styles.foodTitle}>Wine and Cheese</h3>
                        <p className={styles.foodDescription}>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptate, cuaeruntum doloremque laudantium, totam rem
                            aperiam per spiciatis unde omnis iste natus.
                        </p>
                        <a href="#" className={styles.readMore}>
                            READ MORE
                        </a>
                    </div>

                    <div className={styles.foodCard}>
                        <div className={styles.foodImage}>
                            <Image
                                src={img3}
                                alt="Cups Of Coffee"
                                width={300}
                                height={250}
                                className={styles.image}
                            />
                        </div>
                        <h3 className={styles.foodTitle}>Cups Of Coffee</h3>
                        <p className={styles.foodDescription}>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptate, cuaeruntum doloremque laudantium, totam rem
                            aperiam per spiciatis unde omnis iste natus.
                        </p>
                        <a href="#" className={styles.readMore}>
                            READ MORE
                        </a>
                    </div>
                </div>
            </section>

            <section className={styles.chefSection}>
                <div className={styles.chefContent}>
                    <div className={styles.chefInfo}>
                        <div className={styles.sectionTag}>TASTY AND CRUNCHY</div>
                        <h2 className={styles.sectionTitle}>Our Chef</h2>
                        <p className={styles.sectionText} style={{marginBottom: '10px'}}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ullamco laboris
                            nisi ut aliquip ex ea commodo consequat adipiscing elit, sed do eiusmod tempor incididunt ulam.
                        </p>
                        <button className={styles.menuButton}>VIEW OUR MENU</button>
                    </div>
                    <div className={styles.chefImageContainer}>
                        <Image
                            src={chef}
                            alt="Chef"
                            width={517}
                            height={482}
                            className={styles.chefImage}
                        />
                    </div>
                </div>
            </section>

            <section className={styles.specialtiesSection}>
                <div className={styles.sectionTag}>TASTY AND CRUNCHY</div>
                <h2 className={styles.sectionTitle}>Our Specialties</h2>

                <div className={styles.specialtiesContent}>
                    <div className={styles.specialtiesImages}>
                        <Image
                            src={food}
                            alt="Food 1"
                            width={483}
                            height={196}
                            className={styles.specialtyImage}
                        />
                    </div>

                    <div className={styles.specialtiesTabs}>
                        <div className={styles.tabsContainer}>
                            <button className={`${styles.tab} ${styles.activeTab}`}>STARTERS</button>
                            <button className={styles.tab}>MAINS</button>
                            <button className={styles.tab}>DESSERTS</button>
                        </div>

                        <div className={styles.tabContent}>
                            <p>
                                Aliquip ex ea commodo consequat quis nostro exercitation ullamco enim ad minim. Lorem ipsum dolor sit
                                amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostro exercitation ullamco laboris nisi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutDetail