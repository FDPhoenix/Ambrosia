import { Link } from 'react-router'
import styles from '../css/LinkRoute.module.css'

interface LinkItem {
  id: number;
  name: string;
  path: string;
}

function LinkRoute({ links }: { links: LinkItem[] }) {
  return (
    <div className={styles.linkContainer}>
      <div className={styles.linkContent}>
        <Link to='/' className={styles.linkName}>home</Link>
        {links.map((link, index) => (
          <div className={styles.linkContent}>
            <p>&gt;</p>
            <Link to={link.path} className={styles.linkName} style={index === links.length - 1 ? { color: '#FF6600' } : {color: 'grey'}}>{link.name}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LinkRoute

