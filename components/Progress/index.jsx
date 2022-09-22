import { useEffect, useState } from "react";
import styles from "./Progress.module.css";

function Progress({ amount = 10, total = 100, legend, style }) {
    const [percentage, setPercentage] = useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPercentage(((amount / total) * 100).toFixed(1));
        }, 1000);

        return () => clearTimeout(timeout);
    }, [amount, total]);
    return (
        <div style={{ ...style }} className={styles.container}>
            {legend && <span className={styles.legend}>{legend}</span>}
            <div className={styles["bar-wrapper"]}>
                <div className={styles.base}>
                    <div
                        style={{ width: percentage + "%" }}
                        className={styles.bar}
                    ></div>
                </div>
                <b style={{}}>{percentage}%</b>
            </div>
            <div className={styles.description}>
                <span className={styles.numbers}>
                    {amount} of {total}
                </span>
            </div>
        </div>
    );
}

export default Progress;
