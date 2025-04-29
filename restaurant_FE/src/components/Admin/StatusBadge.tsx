import styles from '../../css/AdminCss/StatusBadge.module.css';

const StatusBadge = ({ status, caseTrue, caseFalse }) => {
  var statusTitle = '';

  if (status){
    statusTitle = caseTrue;
  } else {
    statusTitle = caseFalse
  }

  return (
    <span className={`${styles.badge} ${status === true ? styles.available : styles.unavailable}`}>
      <span className={styles.dot}></span>
      {statusTitle}
    </span>
  );
};

export default StatusBadge;
