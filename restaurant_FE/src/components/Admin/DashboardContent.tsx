import styles from "../../css/AdminCss/DashboardContent.module.css";
import BestSellers from "./BestSeller";
import RevenueContent from "./RevenueContent";
import StatisticUser from "./StatisticUserContent";

function DashboardContent() {
  return (
    <div className={styles.container}>
      <StatisticUser />

      <div className={styles.groupStatistic}>
        <RevenueContent />
        <BestSellers />
      </div>
    </div>
  )
}

export default DashboardContent