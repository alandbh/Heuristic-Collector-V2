import { gql, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import Debug from "../../lib/debug";

const QUERY_PLAYERS = gql`
    query {
        players {
            id
            name
            slug
            logo {
                url
            }
        }
    }
`;

function PlayerSelect() {
    const [selected, setSelected] = useState(null);
    const { data, loading, error } = useQuery(QUERY_PLAYERS);

    useEffect(() => {
        setSelected(data?.players[0]);
    }, [data]);

    const handleSelectPlayer = useCallback((player) => {
        setSelected(player);
    }, []);

    if (loading) {
        return <div>LOADING</div>;
    }

    if (error) {
        return <div>SOMETHING WENT WRONG: {error.message}</div>;
    }

    return (
        <div>
            <div className="flex gap-2 items-center content-center">
                <picture className="h-7 block">
                    <source srcSet={selected?.logo.url} type="image/webp" />
                    <img
                        className="object-cover max-h-7"
                        src={selected?.logo.url}
                        alt=""
                    />
                </picture>
                <button>
                    <svg
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10.9391 4.47644C10.9391 4.87427 11.0971 5.2558 11.3784 5.5371C11.6597 5.81841 12.0413 5.97644 12.4391 5.97644C12.8369 5.97644 13.2184 5.81841 13.4997 5.5371C13.7811 5.2558 13.9391 4.87427 13.9391 4.47644C13.9391 4.07862 13.7811 3.69708 13.4997 3.41578C13.2184 3.13448 12.8369 2.97644 12.4391 2.97644C12.0413 2.97644 11.6597 3.13448 11.3784 3.41578C11.0971 3.69708 10.9391 4.07862 10.9391 4.47644ZM10.9391 11.9764C10.9391 12.3743 11.0971 12.7558 11.3784 13.0371C11.6597 13.3184 12.0413 13.4764 12.4391 13.4764C12.8369 13.4764 13.2184 13.3184 13.4997 13.0371C13.7811 12.7558 13.9391 12.3743 13.9391 11.9764C13.9391 11.5786 13.7811 11.1971 13.4997 10.9158C13.2184 10.6345 12.8369 10.4764 12.4391 10.4764C12.0413 10.4764 11.6597 10.6345 11.3784 10.9158C11.0971 11.1971 10.9391 11.5786 10.9391 11.9764V11.9764ZM10.9391 19.4764C10.9391 19.8743 11.0971 20.2558 11.3784 20.5371C11.6597 20.8184 12.0413 20.9764 12.4391 20.9764C12.8369 20.9764 13.2184 20.8184 13.4997 20.5371C13.7811 20.2558 13.9391 19.8743 13.9391 19.4764C13.9391 19.0786 13.7811 18.6971 13.4997 18.4158C13.2184 18.1345 12.8369 17.9764 12.4391 17.9764C12.0413 17.9764 11.6597 18.1345 11.3784 18.4158C11.0971 18.6971 10.9391 19.0786 10.9391 19.4764V19.4764Z"
                            fill="#9B9B9B"
                        />
                    </svg>
                    <span className="sr-only">Select a player</span>
                </button>
            </div>

            <div className="w-full h-full fixed top-0 left-0 bg-white/80 flex items-center justify-center">
                <ul className="bg-white flex flex-wrap max-w-2xl justify-around">
                    {data.players.map((player) => (
                        <>
                            <li
                                className="flex-1 min-w-[200px]"
                                key={player.id}
                            >
                                {/* {player.name} */}
                                <button
                                    className="border p-8 w-full flex justify-center"
                                    onClick={() => handleSelectPlayer(player)}
                                >
                                    <picture className="h-7 block">
                                        <source
                                            srcSet={player.logo.url}
                                            type="image/webp"
                                        />
                                        <img
                                            className="object-cover max-h-7"
                                            src={player.logo.url}
                                            alt=""
                                        />
                                    </picture>
                                </button>
                            </li>
                            <li
                                className="flex-1 min-w-[200px]"
                                key={player.id}
                            >
                                {/* {player.name} */}
                                <button
                                    className="border p-8 w-full flex justify-center"
                                    onClick={() => handleSelectPlayer(player)}
                                >
                                    <picture className="h-7 block">
                                        <source
                                            srcSet={player.logo.url}
                                            type="image/webp"
                                        />
                                        <img
                                            className="object-cover max-h-7"
                                            src={player.logo.url}
                                            alt=""
                                        />
                                    </picture>
                                </button>
                            </li>
                        </>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PlayerSelect;
