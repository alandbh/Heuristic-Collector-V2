import { result } from "./result-0.js";

import marketplace from "./results/marketplace.json";

export default function retail30(req, res) {
    res.status(200).json(marketplace);
}
