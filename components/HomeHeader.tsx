import styles from "../styles/HomeHeader.module.css";

export function HomeHeader() {
    return (
        <div className={styles.rootDiv}>
            <span className={styles.headerText}>Home</span>
        </div>
    );
}