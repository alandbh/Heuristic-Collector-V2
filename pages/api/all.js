// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, useMutation } from "@apollo/client";
import client from "../../lib/apollo";

async function getData(query, variables) {
    let queryString = variables
        ? {
              query: query,
              variables,
          }
        : {
              query: query,
          };

    let result = await client.query(queryString);

    return result;
}

const QUERY_ALL = gql`
    query getAllPlayers {
        players(where: { project: { slug: "retail-30" } }) {
            id
            name
            scores(first: 1000) {
                journey {
                    name
                    slug
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

const QUERY_JOURNEYS = gql`
    query {
        journeys(where: { project: { slug: "retail-30" } }) {
            name
            slug
        }
    }
`;

const QUERY_SCORES = gql`
    query GetScores(
        $projectSlug: String
        $journeySlug: String
        $playerSlug: String
    ) {
        scores(
            where: {
                player: { slug: $playerSlug }
                project: { slug: $projectSlug }
                journey: { slug: $journeySlug }
            }
            first: 1000
        ) {
            id
            scoreValue
            note
            evidenceUrl
            heuristic {
                heuristicNumber
            }
        }
    }
`;

export default async function handler(req, res) {
    const allJourneys = await getData(QUERY_JOURNEYS);
    const allPlayers = await getData(QUERY_ALL);

    const newPlayerArr = allPlayers.data.players.map(({ id, name, scores }) => {
        const playerOb = {};
        playerOb.id = id;
        playerOb.name = name;

        const scoresByJourney = [];

        const journeys = {};

        allJourneys.data.journeys.map((jou) => {
            journeys[jou.slug] = {};

            const scoresByJourney = scores
                .filter((score) => {
                    return score.journey.slug === jou.slug;
                })
                .map((score) => {
                    const heuObj = {};
                    const scoreObj = {};
                    scoreObj.scoreValue = score.scoreValue;
                    scoreObj.note = score.note;
                    heuObj["h_" + score.heuristic.heuristicNumber] = scoreObj;
                    return heuObj;
                });

            // journeys[jou.slug] = scoresByJourney[jou.slug];
            playerOb[jou.slug] = scoresByJourney;
        });

        return playerOb;
    });
    serve(newPlayerArr);

    function serve(data) {
        res.status(200).json(data);
    }
}
