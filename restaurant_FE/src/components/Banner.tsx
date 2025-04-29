import styles from '../css/Banner.module.css'
import BannerImg from '../assets/banner3.jpg'

function Banner() {
  return (
    <div className={styles.hero}>
      <img
        src={BannerImg}
        alt="Restaurant hero image"
        className={styles.heroImage}
      />
    </div>
  )
}

export default Banner
