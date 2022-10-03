import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";

function LoggedUser({ name, picture }) {
    const [popOver, setPopOver] = useState(false);

    function handleYes() {
        console.log("hanlde yes");
        setPopOver(false);
    }
    function handleNo() {
        console.log("hanlde No");
        setPopOver(false);
    }
    return (
        <div className="relative top-0">
            <button
                onClick={() => {
                    setPopOver((prev) => !prev);
                }}
                className="w-7 h-7 flex items-center"
            >
                <Image
                    className="rounded-full overflow-hidden"
                    src={picture}
                    width={28}
                    height={28}
                    alt={`${name}'s picture`}
                />
            </button>

            <div
                className={`absolute min-w-[200px] flex flex-col items-center gap-2 top-0 right-0 px-6 py-6 bg-white dark:bg-slate-800 shadow-lg ${
                    popOver ? "block" : "hidden"
                }`}
            >
                <span>
                    <Image
                        src={picture}
                        width={50}
                        height={50}
                        alt={`${name}'s picture`}
                        className="rounded-full overflow-hidden"
                    />
                </span>
                <h2 className="text-sm font-bold whitespace-nowrap">
                    Hi, {name}!
                </h2>
                <h3 className="mt-6">Log out?</h3>
                <div className="flex justify-around w-full mt-2">
                    <Link tabIndex={0} href="/api/auth/logout">
                        <a className="border border-slate-400 px-4 py-1 text-sm rounded-md hover:bg-primary hover:text-white hover:border-transparent">
                            Yes
                        </a>
                    </Link>
                    <button
                        onClick={handleNo}
                        className="text-sm hover:underline underline-offset-2 px-4"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoggedUser;
