import { useEffect, useState } from "react";
import styles from "./Progress.module.css";

function Progress({ amount = 10, total = 100 }) {
    const [percentage, setPercentage] = useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPercentage(((amount / total) * 100).toFixed(1));
        }, 1000);

        return () => clearTimeout(timeout);
    }, [amount, total]);
    return (
        <div className={styles.container}>
            <b style={{ left: percentage + "%" }}>{percentage}%</b>
            <div className={styles.base}>
                <div
                    style={{ width: percentage + "%" }}
                    className={styles.bar}
                ></div>
            </div>
            <span>
                {amount} of {total}
            </span>
        </div>
    );
}

export default Progress;
