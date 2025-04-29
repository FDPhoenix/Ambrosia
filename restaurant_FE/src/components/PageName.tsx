import styles from '../css/PageName.module.css'

function PageName(props: { name: string }) {
    return (
        <div className={styles.container}>
            <h1>{props.name}</h1>
        </div>
    )
}

export default PageName
