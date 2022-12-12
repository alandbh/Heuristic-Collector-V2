import marketplace from "./results/marketplace.json";
import fashion from "./results/fashion.json";
import beauty from "./results/beauty.json";
// import supermarket from "./results/supermarket.json";
// Deploying MKT and Fashion in Vercel

const results = [...marketplace, ...fashion, ...beauty];

export default function retail30(req, res) {
    res.status(200).json(results);
}
