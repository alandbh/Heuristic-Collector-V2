// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, useMutation } from "@apollo/client";
import client from "../../lib/apollo";

const QUERY_ALL = gql`
    query getAllPlayers {
        players(where: { project: { slug: "retail-30" } }) {
            id
            name
            scores {
                journey {
                    name
                }
                heuristic {
                    heuristicNumber
                }
                scoreValue
                note
            }
        }
    }
`;

export default function handler(req, res) {
    client
        .query({
            query: QUERY_ALL,
        })
        .then((data) => {
            res.status(200).json(data);
        });
}
