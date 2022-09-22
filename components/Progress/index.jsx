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
            <b style={{ left: percentage + "%" }}>{percentage}%</b>
            <div className={styles.base}>
                <div
                    style={{ width: percentage + "%" }}
                    className={styles.bar}
                ></div>
            </div>
            <div className={styles.description}>
                <span className={styles.numbers}>
                    {amount} of {total}
                </span>
                {legend && <span className={styles.legend}>{legend}</span>}
            </div>
        </div>
    );
}

export default Progress;
