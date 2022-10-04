import Link from "next/link";
import Logo from "../components/Logo";
import LoggedUser from "../components/LoggedUser";
import { useUser } from "@auth0/nextjs-auth0";

export default function Home(props) {
    console.log("credential", useUser().user);

    // const { given_name, picture } = useCredentialsContext().user;
    return (
        <>
            <div className="flex flex-col max-w-5xl mx-auto px-4">
                <div className="flex w-full justify-between my-10">
                    <Logo />

                    <div className="flex items-center gap-5">
                        <Link href="/projects">
                            <a className="bg-primary text-sm hover:bg-primary/70 text-white/80 uppercase px-6 py-5 rounded-md font-bold h-1 flex items-center">
                                {useUser().user ? "Enter " : "Log In"}
                            </a>
                        </Link>
                        <LoggedUser
                            picture={useUser()?.user?.picture}
                            name={useUser()?.user?.given_name}
                            size={40}
                        />
                    </div>
                </div>
                <div className="md:grid grid-cols-8 gap-y-20 gap-10 px-4 my-20">
                    <div className="col-span-3 max-w-[300px] mx-auto mb-10">
                        <video
                            className="shadow-xl"
                            playsInline
                            autoPlay
                            muted
                            loop
                        >
                            <source src={"/video1a.webm"} type="video/webm" />
                        </video>
                    </div>
                    <div className="col-span-5">
                        <P className="font-bold text-3xl">
                            No more typing long texts into spreadsheets
                        </P>
                        <P>
                            Spreadsheets are great for storing and visualizing
                            data.
                        </P>
                        <P>
                            It turns out that when we need to run a heuristic
                            evaluation, using a smartphone, tablet or even a
                            laptop, it is quite difficult to manually enter data
                            into these spreadsheets. Especially when there are
                            many columns.
                        </P>
                        <div className="mt-10">
                            <Link href="/projects">
                                <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                    Get Started
                                </a>
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-5 mt-20">
                        <P className="font-bold text-3xl">
                            Typos? Not a biq dieal! 🤓
                        </P>
                        <P>
                            Fuzzy search to quickly find the heuristic. No need
                            to type the exact term. 🙌🏽
                        </P>
                        <div className="mt-10">
                            <Link href="/projects">
                                <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                    Get Started
                                </a>
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-3 max-w-[300px] mx-auto mb-10 mt-10">
                        <video
                            className="shadow-xl"
                            playsInline
                            autoPlay
                            muted
                            loop
                        >
                            <source src={"/video2.webm"} type="video/webm" />
                        </video>
                    </div>

                    <div className="col-span-3 mt-20 max-w-[300px] mx-auto">
                        <video
                            className="shadow-xl"
                            playsInline
                            autoPlay
                            muted
                            loop
                        >
                            <source src={"/video3.webm"} type="video/webm" />
                        </video>
                    </div>
                    <div className="col-span-5 mt-20">
                        <P className="font-bold text-3xl">
                            Extra findings or blockers
                        </P>
                        <P>
                            If you have found something interesting beyond the
                            heuristic, you can register it easely.
                        </P>
                        <P>
                            Moreover, if you stumbled upon any blockers, you can
                            register it too.
                        </P>
                        <div className="mt-10">
                            <Link href="/projects">
                                <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                    Get Started
                                </a>
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-5 mt-20">
                        <P className="font-bold text-3xl">
                            Producers, we hear you.
                        </P>
                        <P>
                            In Progress tab, producers can follow the work in
                            progress.
                        </P>
                        <small>in beta</small>
                        <div className="mt-10">
                            <Link href="/projects">
                                <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                    Get Started
                                </a>
                            </Link>
                        </div>
                    </div>

                    <div className="col-span-3 mt-10 max-w-[300px] mx-auto">
                        <video
                            className="shadow-xl"
                            playsInline
                            autoPlay
                            muted
                            loop
                        >
                            <source src={"/video4.webm"} type="video/webm" />
                        </video>
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
        <p className={`text-lg mb-4 text-slate-600 ` + props.className}>
            {props.children}
        </p>
    );
}
