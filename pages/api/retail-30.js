import marketplace from "./results/marketplace.json";

export default function retail30(req, res) {
    res.status(200).json(marketplace);
}
