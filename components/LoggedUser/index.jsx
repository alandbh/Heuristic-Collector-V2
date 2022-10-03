import Image from "next/image";
import React, { useState } from "react";

function LoggedUser() {
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
                    src="https://lh3.googleusercontent.com/a-/ACNPEu9KjxVWq0LeckFHND-5dp4FwDR3QXVAoseqs8xpOw=s96-c"
                    width={28}
                    height={28}
                    alt="avatar"
                />
            </button>

            <div
                className={`absolute flex flex-col items-center gap-2 top-0 right-0 px-6 py-6 bg-white dark:bg-slate-800 shadow-lg ${
                    popOver ? "block" : "hidden"
                }`}
            >
                <span>
                    <Image
                        src="https://lh3.googleusercontent.com/a-/ACNPEu9KjxVWq0LeckFHND-5dp4FwDR3QXVAoseqs8xpOw=s96-c"
                        width={50}
                        height={50}
                        alt="avatar"
                        className="rounded-full overflow-hidden"
                    />
                </span>
                <h2 className="text-sm font-bold whitespace-nowrap">
                    Hi, AlanVasconcelos!
                </h2>
                <h3 className="mt-6">Log out?</h3>
                <div className="flex justify-around w-full mt-2">
                    <button
                        onClick={handleYes}
                        className="border border-slate-400 px-4 py-1 text-sm rounded-md hover:bg-primary hover:text-white hover:border-none"
                    >
                        Yes
                    </button>
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
