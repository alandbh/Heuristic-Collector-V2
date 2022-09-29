// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, useMutation } from "@apollo/client";
import client from "../../lib/apollo";

async function getData(query, variables) {
    let queryString = variables
        ? {
              query: query,
              variables,
              fetchPolicy: "network-only",
          }
        : {
              query: query,
              fetchPolicy: "network-only",
          };

    let result = await client.query(queryString);

    return result;
}

const QUERY_ALL = gql`
    query getAllPlayers($projectSlug: String) {
        players(where: { project: { slug: $projectSlug } }) {
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
            finding {
                findingObject
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

// scores": {
//     "mobile": {
//       "h_1_1": {
//         "score": 5,
//         "note": "Easy navigation"
//       },
//       "h_1_2": {
//         "score": "5",
//         "note": "n/a"
//       },

export default async function handler(req, res) {
    const { project } = req.query;
    const allJourneys = await getData(QUERY_JOURNEYS);
    const allPlayers = await getData(QUERY_ALL, { projectSlug: project });

    console.log(req.query);
    // console.log(allPlayers.data.players[0].finding);

    const newPlayerArr = allPlayers.data.players.map(
        ({ id, name, scores, finding }) => {
            const playerOb = {};
            playerOb.id = id;
            playerOb.name = name;

            const journeys = {};

            allJourneys.data.journeys.map((jou) => {
                journeys[jou.slug] = {};

                const scoresByJourney = scores
                    .filter((score) => {
                        return score.journey.slug === jou.slug;
                    })
                    .map((score) => {
                        return {
                            journey: score.journey.slug,
                            heuristic: "h_" + score.heuristic.heuristicNumber,
                            scoreValue: score.scoreValue,
                            note: score.note,
                        };
                    });

                scoresByJourney.sort((a, b) => {
                    const nameA = a.heuristic.toUpperCase(); // ignore upper and lowercase
                    const nameB = b.heuristic.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });

                scoresByJourney.map((score) => {
                    journeys[jou.slug][score.heuristic] = {};
                    journeys[jou.slug][score.heuristic].scoreValue =
                        score.scoreValue;
                    journeys[jou.slug][score.heuristic].note = score.note;
                });

                playerOb.scores = journeys;
            });

            playerOb.findings = finding.map((item) => item.findingObject);

            return playerOb;
        }
    );
    serve(newPlayerArr);
    // serve(allPlayers);

    function serve(data) {
        res.status(200).json(data);
    }
}
