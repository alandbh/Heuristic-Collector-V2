import { useEffect, useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { Link as Scroll } from "react-scroll";
import Fuse from "fuse.js";
import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";
import { getUnicItem, debounce, useScroll } from "../../lib/utils";
import Findings from "../Findings";
import client from "../../lib/apollo";

const QUERY_JOURNEYS = gql`
    query GetGroups($playerSlug: String, $projectSlug: String) {
        journeys(
            where: {
                players_some: {
                    slug: $playerSlug
                    project: { slug: $projectSlug }
                }
            }
        ) {
            name
            slug
        }
    }
`;

const QUERY_FINDINGS = gql`
    query GetAllFindings(
        $projectSlug: String
        $playerSlug: String
        $journeySlug: String
    ) {
        findings(
            where: {
                player: { slug: $playerSlug }
                journey: { slug: $journeySlug }
                project: { slug: $projectSlug }
            }
        ) {
            id
            findingObject
        }
    }
`;

// let selectedJourney;

const uniqueHeuristics = [];
let groupsMapped = null;

const getUniqueGroups = debounce((arr, key, func) => {
    groupsMapped = getUnicItem(arr, key);

    console.log("unique", groupsMapped);

    func(groupsMapped);

    // func();
}, 300);

const debCreateNewScores = debounce((data, router, func) => {
    // return;
    console.log("groupssss", data.groups);

    if (data.groups.length === 0) {
        return null;
    }

    data.groups.forEach((group) => {
        group.heuristic.forEach((heurisric) => {
            return (multiString =
                multiString +
                stringCreateFunc(
                    heurisric.id,
                    router.query.slug,
                    router.query.player,
                    router.query.journey
                ));
        });
    });

    stringCreate = `
    mutation createMultipleScores {
       ${multiString}
    }
    `;

    MUTATION_CREATE_MANY_SCORE = gql(stringCreate);

    client
        .mutate({
            mutation: MUTATION_CREATE_MANY_SCORE,
        })
        .then((data) => {
            publishNewScores(func);
        });
}, 500);

function publishNewScores(func) {
    const PUBLISH_STRING = gql`
        mutation publishManyScores {
            publishManyScoresConnection(first: 1000, where: { scoreValue: 0 }) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `;

    client
        .mutate({
            mutation: PUBLISH_STRING,
        })
        .then((data) => {
            console.log("PUBLICOU", data);
            func();
        });
}

let multiString = "";

let stringCreate = "";

let MUTATION_CREATE_MANY_SCORE;

const stringCreateFunc = (
    heuristicId,
    projectSlug,
    playerSlug,
    journeySlug
) => `createScore(
    data: {
        scoreValue: 0
        project: { connect: { slug: "${projectSlug}" } }
        player: { connect: { slug: "${playerSlug}" } }
        journey: { connect: { slug: "${journeySlug}" } }
        evidenceUrl: ""
        note: ""
        heuristic: { connect: { id: "${heuristicId}" } }
    }
) {
    scoreValue
    id
},

`;

/**
 *
 *
 *
 * ---------------------------------
 * GroupContainer COMPONENT
 * ---------------------------------
 *
 *
 */

export default function GroupContainer({ data }) {
    const router = useRouter();
    const [findingsList, setFindingsList] = useState(null);
    const [findingsLoading, setFindingsLoading] = useState(true);
    const [empty, setEmpty] = useState(true);
    const [validJourney, setValidJourney] = useState(true);
    const [groups, setGroups] = useState(null);
    const [newScores, setNewScores] = useState([]);
    const { allScores, getNewScores } = useScoresContext();
    const {
        data: dataJourneys,
        loading,
        error,
    } = useQuery(QUERY_JOURNEYS, {
        variables: {
            playerSlug: router.query.player,
            projectSlug: router.query.slug,
        },
    });

    function getFindings() {
        client
            .query({
                query: QUERY_FINDINGS,
                variables: {
                    playerSlug: router.query.player,
                    projectSlug: router.query.slug,
                    journeySlug: router.query.journey,
                },
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setFindingsList(data);
            });
    }
    useEffect(() => {
        getFindings();
    });

    // useEffect(() => {
    //     if (router.query.journey && dataJourneys) {
    //         selectedJourney = dataJourneys.journeys?.find(
    //             (journey) => journey.slug === router.query.journey
    //         );
    //     }
    // }, [dataJourneys, router]);

    /**
     *
     * Setting empty scores
     * ------------------------------
     */

    useEffect(() => {
        // setEmpty(true);
        getNewScores().then((dataScores) => {
            // console.log("newscores");

            if (dataScores.length > 0) {
                console.log("newscoreswwww", dataScores);
                setEmpty(false);
            } else {
                createNewScores();
                // debCreateNewScores(data, router);
            }
        });

        function createNewScores() {
            if (dataJourneys) {
                console.log("invalid");

                if (dataJourneys.journeys.length > 0) {
                    if (
                        !dataJourneys.journeys.find(
                            (journeyObj) =>
                                journeyObj.slug === router.query.journey
                        )
                    ) {
                        console.log("nao tem", dataJourneys.journeys);
                        router.replace("/project/", {
                            query: {
                                slug: router.query.slug,
                                player: router.query.player,
                                journey: dataJourneys.journeys[0].slug,
                            },
                            shallow: true,
                        });
                        setValidJourney(false);
                        return;
                    }
                }
            }

            debCreateNewScores(data, router, () => {
                console.log("debCreateNewScores");
                setEmpty(false);
            });
        }
    }, [getNewScores, data, router, dataJourneys]);

    const [allHeuristics, setAllHeuristics] = useState([]);

    useEffect(() => {
        let heuristicsArr = [];
        data.groups.map((group) => {
            group.heuristic.map((heurisric) => {
                heuristicsArr.push(heurisric);
            });
        });

        console.log("allHeuristics", heuristicsArr);
        setAllHeuristics(heuristicsArr);
    }, [data.groups]);

    const [scrollY] = useScroll(0);

    if (!dataJourneys) {
        return null;
    }

    if (!validJourney) {
        return (
            <div className="flex p-20 items-center text-center">
                This player does not have this journey. <br />
                Please select another journey or player.
            </div>
        );
    }

    return (
        <>
            <div className="gap-5 max-w-5xl mx-auto flex flex-col-reverse md:grid md:grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    {data.groups.map((group) => (
                        <HeuristicGroup group={group} key={group.id} />
                    ))}

                    <Findings
                        data={findingsList}
                        router={router}
                        getFindings={getFindings}
                    />
                </div>
                <div className="relative mr-4">
                    <div
                        className={
                            scrollY > 150 ? "md:sticky top-8" : "relative"
                        }
                    >
                        <aside className="mb-10 mx-4 md:mx-0">
                            <div>
                                <SearchBox data={allHeuristics} />
                            </div>
                        </aside>
                        <aside className="hidden md:block">
                            <h1 className="text-slate-400 text-sm uppercase mb-5 border-b-2 pb-3">
                                Heuristic Groups
                            </h1>
                            <ul>
                                {data.groups.map((group) => (
                                    <li
                                        key={group.id}
                                        className="cursor-pointer"
                                    >
                                        <Scroll
                                            activeClass="underline underline-offset-4 hover:text-blue-700"
                                            className="py-1 block text-primary font-bold hover:text-primary/70"
                                            to={group.id}
                                            spy={true}
                                            smooth={true}
                                            offset={-50}
                                        >
                                            {group.name}
                                        </Scroll>
                                    </li>
                                ))}

                                <li className="mt-5">
                                    <hr />
                                </li>

                                <li className="cursor-pointer mt-5">
                                    <Scroll
                                        activeClass="underline underline-offset-4 hover:text-blue-700"
                                        className="py-1 block text-primary font-bold hover:text-primary/70"
                                        to="findings_section"
                                        spy={true}
                                        smooth={true}
                                        offset={-50}
                                    >
                                        General Findings
                                    </Scroll>
                                </li>
                            </ul>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

function SearchBox(data) {
    const [result, setResult] = useState([]);
    const [vw, setVw] = useState(1024);

    if (window !== undefined) {
        window.addEventListener("resize", function () {
            // viewport and full window dimensions will change
            setVw(window.innerWidth);
        });
    }

    useEffect(() => {
        if (window !== undefined) {
            setVw(window.innerWidth);
        }
    }, []);

    const options = {
        includeScore: true,
        keys: ["name", "description"],
        minMatchCharLength: 3,
        threshold: 0.3,
        location: 0,
        distance: 2000,
    };

    if (data) {
        const fuse = new Fuse(data.data, options);

        function handleSearch(term) {
            setResult(fuse.search(term));
        }
    }

    const inputRef = useRef(null);

    function handleClick(id) {
        console.log("clicou", id);

        inputRef.current.value = "";
        setResult([]);

        const heuristicElement = document.getElementById(id);

        heuristicElement.classList.add(
            "bg-blue-100",
            "animate-pulse",
            "text-slate-700"
        );

        heuristicElement.style.boxShadow = "7px 0 0px 24px rgb(219, 234, 254)";

        setTimeout(() => {
            heuristicElement.classList.remove(
                "bg-blue-100",
                "animate-pulse",
                "text-slate-700"
            );
            heuristicElement.style.boxShadow = "none";
        }, 5000);
    }
    return (
        <>
            <div className=" rounded-md flex items-center gap-2 pl-2 border-slate-200 border text-slate-500 w-full bg-white dark:bg-transparent">
                <label htmlFor="search">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.325 14.899L21.705 20.279C21.8941 20.4682 22.0003 20.7248 22.0002 20.9923C22.0001 21.2599 21.8937 21.5164 21.7045 21.7055C21.5153 21.8946 21.2587 22.0008 20.9912 22.0007C20.7236 22.0006 20.4671 21.8942 20.278 21.705L14.898 16.325C13.2897 17.5707 11.2673 18.1569 9.24214 17.9643C7.21699 17.7718 5.34124 16.815 3.99649 15.2886C2.65174 13.7622 1.939 11.7808 2.00326 9.74753C2.06753 7.71427 2.90396 5.78185 4.34242 4.34339C5.78087 2.90494 7.71329 2.0685 9.74656 2.00424C11.7798 1.93998 13.7612 2.65272 15.2876 3.99747C16.814 5.34222 17.7708 7.21796 17.9634 9.24312C18.1559 11.2683 17.5697 13.2907 16.324 14.899H16.325ZM10 16C11.5913 16 13.1174 15.3678 14.2427 14.2426C15.3679 13.1174 16 11.5913 16 9.99999C16 8.40869 15.3679 6.88257 14.2427 5.75735C13.1174 4.63213 11.5913 3.99999 10 3.99999C8.40871 3.99999 6.88259 4.63213 5.75737 5.75735C4.63215 6.88257 4.00001 8.40869 4.00001 9.99999C4.00001 11.5913 4.63215 13.1174 5.75737 14.2426C6.88259 15.3678 8.40871 16 10 16V16Z"
                            fill="currentColor"
                        />
                    </svg>
                    <span className="sr-only">Search for heuristics</span>
                </label>

                <input
                    className="h-10 p-2 rounded-md bg-transparent  text-slate-500 w-full"
                    onChange={(e) => handleSearch(e.target.value)}
                    type="search"
                    name="search"
                    id="search"
                    autoComplete="off"
                    ref={inputRef}
                    accessKey="s"
                />
            </div>
            <div className="px-1">
                <ul className="bg-white shadow-md px-1">
                    {result?.map((item, index) => (
                        <li
                            key={index}
                            className="block cursor-pointer w-full py-1 border-b-2"
                        >
                            <Scroll
                                activeClass="hover:text-blue-700"
                                className="py-1 px-4 w-full block text-slate-500 hover:text-slate-800 focus:bg-blue-100 focus:outline-none"
                                to={item.item.id}
                                spy={true}
                                smooth={true}
                                offset={vw < 700 ? -150 : -50}
                                onClick={() => handleClick(item.item.id)}
                                tabIndex={0}
                                href="#"
                            >
                                <b className="text-blue-400">
                                    {item.item.name}
                                </b>
                                <span className=" block w-full mt-2 text-sm">
                                    {item.item.description.substring(0, 130)}...
                                </span>
                            </Scroll>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
