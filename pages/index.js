import Link from "next/link";
import Logo from "../components/Logo";
import LoggedUser from "../components/LoggedUser";
import { useUser } from "@auth0/nextjs-auth0";

export default function Home(props) {
    console.log("credential", useUser().user);

    // const { given_name, picture } = useCredentialsContext().user;

    const userObj = useUser()?.user;

    if (userObj !== undefined) {
        const { given_name, picture } = userObj;
    }

    return (
        <>
            <div className="flex flex-col  px-0">
                <div className="flex w-full max-w-5xl mx-auto justify-between my-10 px-4">
                    <Logo />

                    <div className="flex items-center gap-5">
                        <Link href="/projects">
                            <a className="bg-primary text-sm hover:bg-primary/70 text-white/80 uppercase px-6 py-5 rounded-md font-bold h-1 flex items-center">
                                {useUser().user ? "Enter " : "Log In"}
                            </a>
                        </Link>

                        {userObj && (
                            <LoggedUser
                                picture={userObj.picture}
                                name={userObj.given_name}
                                size={40}
                            />
                        )}
                    </div>
                </div>
                <div className="my-20">
                    <Section mt={10}>
                        <div className="col-span-3 max-w-[300px] mx-auto md:mx-0 mb-10">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video1a.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                No more typing long texts into spreadsheets
                            </P>
                            <P>
                                Spreadsheets are great for storing and
                                visualizing data.
                            </P>
                            <P>
                                It turns out that when we need to run a
                                heuristic evaluation, using a smartphone, tablet
                                or even a laptop, it is quite difficult to
                                manually enter data into these spreadsheets.
                                Especially when there are many columns.
                            </P>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold items-center">
                                        Check it out
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </Section>

                    <Section reverse>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                Typos? Not a biq dieal! 🤓
                            </P>
                            <P>
                                Fuzzy search to quickly find the heuristic. No
                                need to type the exact term. 🙌🏽
                            </P>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                        Get Started
                                    </a>
                                </Link>
                            </div>
                        </div>

                        <div className="col-span-3 max-w-[300px] mx-auto md:mx-0">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video2.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                    </Section>

                    <Section>
                        <div className="col-span-3 max-w-[300px] mx-auto md:mx-0 mb-10">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video3.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                Extra findings or blockers
                            </P>
                            <P>
                                If you have found something interesting beyond
                                the heuristics, you can register it easily.
                            </P>
                            <P>
                                Moreover, if you stumbled upon any blockers, you
                                can register it too.
                            </P>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                        Get Started
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </Section>

                    <Section reverse>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                Producers, we hear you.
                            </P>
                            <P>
                                In Progress tab, producers can follow the work
                                in progress.
                            </P>
                            <small>(experimental)</small>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                        Get Started
                                    </a>
                                </Link>
                            </div>
                        </div>

                        <div className="col-span-3 max-w-[300px] mx-auto">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video4.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                    </Section>

                    <Section bg="[#5582c4]">
                        <div className="col-span-8 pt-1 text-center">
                            <h1 className="text-4xl my-20 text-white/90">
                                Concept and Architecture
                            </h1>

                            <div className="w-md">
                                <p className="text-lg mb-4 text-white/90 ">
                                    We needed to deal with three entities:
                                    Players, Heuristics, and Journeys.
                                </p>
                                <p className="text-lg mb-4 text-white/90 ">
                                    Each retailer (or player) was evaluated in
                                    one or more journeys. So, the list of
                                    heuristics could vary according to the
                                    journey.
                                </p>
                            </div>

                            <picture>
                                <source
                                    srcSet="/architecture.svg"
                                    type="image/webp"
                                />
                                <img src="/architecture.svg" alt="" />
                            </picture>
                        </div>
                    </Section>

                    <Section py={20}>
                        <div className="col-span-5 mb-10">
                            <h1 className="text-4xl mb-10">
                                Managing the data
                            </h1>
                            <P>
                                All data collected is stored in a Google Sheets
                                document in raw and human-readable format.
                            </P>
                        </div>

                        <div className="col-span-3">
                            <div className="w-52 mx-auto">
                                <picture>
                                    <source
                                        srcSet="/googlesheets.svg"
                                        type="image/webp"
                                    />
                                    <img src="/googlesheets.svg" alt="" />
                                </picture>
                            </div>
                        </div>
                    </Section>
                    <div className="col-span-8 relative mt-12 flex justify-end opacity-80 dark:opacity-100 dark:mix-blend-multiply mix-blend-luminosityyy inverttt">
                        <picture className="w-[100%] mx-auto">
                            <source srcSet="/sheet.png" type="image/webp" />
                            <img className="w-full" src="/sheet.png" alt="" />
                        </picture>
                    </div>
                </div>
            </div>
        </>
    );
}

// export async function getStaticProps() {
//     const res = await client.query({
//         query: heuristicQuery,
//     });

//     return {
//         props: {
//             countries: res,
//         },
//     };
// }

function P(props) {
    return (
        <p
            className={
                `text-lg mb-4 text-slate-600 dark:text-slate-400 ` +
                props.className
            }
        >
            {props.children}
        </p>
    );
}

function Section(props) {
    const {
        cols = 8,
        gap = 10,
        mt = 20,
        mb = 20,
        py = 4,
        bg = "transparent",
        className = "",
        reverse = false,
    } = props;

    const gridObj = {
        12: "grid-cols-12",
        8: "grid-cols-8",
        4: "grid-cols-4",
        3: "grid-cols-3",
    };

    const gridClass = gridObj[cols];
    return (
        <div className={`mb-${mb} mt-${mt} bg-${bg} px-5`}>
            <section
                className={`max-w-5xl ${gridClass} py-${py} ${
                    reverse && "flex flex-col-reverse"
                }  mx-auto md:grid grid-cols-${cols}  gap-${gap} ${className}`}
            >
                {props.children}
            </section>
        </div>
    );
}
