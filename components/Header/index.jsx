import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useProjectContext } from "../../context/project";
import JourneySelect from "../JourneySelect";
import PlayerSelect from "../PlayerSelect";

function Header({ routes, className }) {
    const router = useRouter();
    const { slug, tab } = router.query || "";
    const isDash = tab === "dash";

    const { project } = useProjectContext();

    function handleNav(param, value) {
        if (value) {
            router.replace("/project/" + router.query.slug, undefined, {
                shallow: true,
            });

            router.replace({
                query: {
                    slug: router.query.slug,
                    tab: value,
                },
            });
        }
        router.replace("/project/" + router.query.slug, undefined, {
            shallow: true,
        });
    }

    const LINK_CLASSES = `border flex gap-2 align-middle items-center py-1 px-4 md:px-5 rounded-full transition-all text-xs md:text-sm `;

    return (
        <header>
            <div className="bg-primary flex justify-between px-5 items-center h-12">
                <Link href={`/`}>
                    <a>
                        <div className="py-1 hidden sm:block">
                            <Image
                                src={`/logo-white-35.svg`}
                                width={100}
                                height={35}
                                alt={`Back to Project Gallery`}
                            />
                        </div>
                        <div className="block sm:hidden bg-red-600 h-6 w-6"></div>
                    </a>
                </Link>
                <div className="flex gap-5 items-center ">
                    <nav className="border-white/50 border rounded-full flex font-bold text-white">
                        {/* <Link href={`/project/${routes.slug}`}> */}
                        {/* <a href={`/project/${routes.slug}`}> */}
                        <button
                            onClick={() => {
                                handleNav("tab", "");
                            }}
                        >
                            <span
                                className={`${
                                    isDash
                                        ? "border-transparent opacity-60"
                                        : "border-white text-white opacity-100"
                                } ${LINK_CLASSES} `}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="17"
                                    fill="none"
                                    viewBox="0 0 16 17"
                                >
                                    <path
                                        fill="#fff"
                                        d="M13.92 12.521a2.676 2.676 0 00-5.312.26c-2.742-.085-3.715-.726-3.556-2.03.059-.487.353-.747.894-.874A3.29 3.29 0 016.97 9.82c.03.003.062.005.092.009.202.048.408.089.613.121.609.1 1.228.15 1.818.118 1.657-.09 2.785-.82 2.843-2.37.055-1.502-.977-2.566-2.641-3.278-.534-.229-1.1-.406-1.667-.54a9.722 9.722 0 00-.628-.128 2.676 2.676 0 00-5.32-.045 2.676 2.676 0 005.177 1.229c.168.03.334.064.5.103a8.848 8.848 0 011.471.475c1.263.54 1.952 1.252 1.92 2.141-.028.797-.6 1.165-1.718 1.225a7.319 7.319 0 01-1.559-.103 7.906 7.906 0 01-.403-.077c-.07-.014-.118-.027-.14-.032l-.055-.01a4.46 4.46 0 00-1.593.059c-.985.23-1.677.842-1.805 1.888-.28 2.254 1.403 3.299 4.928 3.374a2.677 2.677 0 005.116-1.458zM4.733 5.518a1.488 1.488 0 110-2.975 1.488 1.488 0 010 2.975zm6.544 8.925a1.489 1.489 0 110-2.978 1.489 1.489 0 010 2.978z"
                                    ></path>
                                </svg>{" "}
                                Evaluation
                            </span>
                        </button>
                        {/* </a> */}
                        {/* </Link> */}
                        {/* <Link href={`/project/${routes.slug}?tab=${routes.tab}`}> */}
                        <button
                            onClick={() => {
                                handleNav("tab", routes.tab);
                            }}
                        >
                            <span
                                className={`${
                                    isDash
                                        ? "border-white opacity-100"
                                        : "border-transparent opacity-60"
                                } ${LINK_CLASSES}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="17"
                                    fill="none"
                                    viewBox="0 0 16 17"
                                >
                                    <path
                                        fill="#fff"
                                        d="M14.714 13.5H2.428V2.359a.143.143 0 00-.143-.143h-1a.143.143 0 00-.142.143v12.285c0 .079.064.143.142.143h13.429a.143.143 0 00.143-.143v-1a.143.143 0 00-.143-.142zM4 12.073h1a.143.143 0 00.143-.143V9.358A.143.143 0 005 9.215H4a.143.143 0 00-.143.143v2.571c0 .079.064.143.143.143zm2.714 0h1a.143.143 0 00.143-.143V6.215a.143.143 0 00-.143-.143h-1a.143.143 0 00-.143.143v5.714c0 .079.064.143.143.143zm2.714 0h1a.143.143 0 00.143-.143V7.608a.143.143 0 00-.143-.143h-1a.143.143 0 00-.143.143v4.321c0 .079.065.143.143.143zm2.715 0h1a.143.143 0 00.142-.143V4.786a.143.143 0 00-.142-.143h-1a.143.143 0 00-.143.143v7.143c0 .079.064.143.143.143z"
                                    ></path>
                                </svg>
                                Dashboardaa
                            </span>
                        </button>
                        {/* </Link> */}
                    </nav>
                    <ToggleTheme />
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 shadow-md px-5 py-3">
                <div className="flex items-center gap-8 justify-between sm:justify-start">
                    <b className="hidden sm:inline">{project.name}</b>
                    <svg
                        className="hidden sm:inline"
                        width="21"
                        height="54"
                        viewBox="0 0 21 54"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <line
                            x1="19.623"
                            y1="0.359609"
                            x2="0.469857"
                            y2="52.9824"
                            stroke="#C4C4C4"
                        />
                    </svg>

                    {router.query.tab !== "dash" ? (
                        <>
                            <PlayerSelect />
                            <JourneySelect />
                        </>
                    ) : (
                        <h2 className="text-2xl font-bold">Dashboard</h2>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;

function ToggleTheme(props) {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (localStorage.theme === "dark") {
                document.documentElement.classList.add("dark");
                setDark(true);
            } else {
                document.documentElement.classList.remove("dark");
                setDark(false);
            }
        }
    }, []);

    function handleChange() {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (!dark) {
            setDark(true);
            // Whenever the user explicitly chooses dark mode
            localStorage.theme = "dark";
            document.documentElement.classList.add("dark");
            console.log("dark", true);
        } else {
            setDark(false);
            // Whenever the user explicitly chooses light mode
            localStorage.theme = "light";
            document.documentElement.classList.remove("dark");
            console.log("dark", false);
        }
    }
    return (
        <label
            className="cursor-pointer hover:bg-black/20 transition p-2 rounded-full"
            htmlFor="toggleTheme"
        >
            {dark ? (
                <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 16.5C8.4087 16.5 6.88258 15.8679 5.75736 14.7426C4.63214 13.6174 4 12.0913 4 10.5C4 8.9087 4.63214 7.38258 5.75736 6.25736C6.88258 5.13214 8.4087 4.5 10 4.5C11.5913 4.5 13.1174 5.13214 14.2426 6.25736C15.3679 7.38258 16 8.9087 16 10.5C16 12.0913 15.3679 13.6174 14.2426 14.7426C13.1174 15.8679 11.5913 16.5 10 16.5ZM10 14.5C11.0609 14.5 12.0783 14.0786 12.8284 13.3284C13.5786 12.5783 14 11.5609 14 10.5C14 9.43913 13.5786 8.42172 12.8284 7.67157C12.0783 6.92143 11.0609 6.5 10 6.5C8.93913 6.5 7.92172 6.92143 7.17157 7.67157C6.42143 8.42172 6 9.43913 6 10.5C6 11.5609 6.42143 12.5783 7.17157 13.3284C7.92172 14.0786 8.93913 14.5 10 14.5V14.5ZM9 0.5H11V3.5H9V0.5ZM0 9.5H3V11.5H0V9.5ZM17 9.5H20V11.5H17V9.5ZM9 17.5H11V20.5H9V17.5ZM16.621 2.5L18.036 3.914L15.914 6.036L14.5 4.62L16.621 2.5V2.5ZM14.5 15.914L15.914 14.5L18.036 16.621L16.621 18.036L14.5 15.914V15.914ZM4.121 14.5L5.536 15.914L3.414 18.036L2 16.62L4.121 14.5ZM2 3.914L3.414 2.5L5.536 4.621L4.12 6.036L2 3.914Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                </svg>
            ) : (
                <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.97 0C7.73458 0.702878 6.70815 1.72146 5.99582 2.95145C5.28348 4.18143 4.91082 5.57864 4.916 7C4.916 11.418 8.438 15 12.782 15C13.928 15 15.018 14.75 16 14.302C14.39 16.544 11.787 18 8.849 18C3.962 18 0 13.97 0 9C0 4.03 3.962 0 8.849 0H8.969H8.97Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                </svg>
            )}

            <input
                className="sr-only"
                type="checkbox"
                name="toggleTheme"
                id="toggleTheme"
                checked={dark}
                onChange={() => handleChange()}
            />
        </label>
    );
}
<svg
    width="16"
    height="18"
    viewBox="0 0 16 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
></svg>;
