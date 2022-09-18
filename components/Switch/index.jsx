import { useState } from "react";

function Switch({ onChange, options, selected }) {
    const [option, setOption] = useState(selected);

    function handleOnChange(ev) {
        setOption(ev.target.value);
        onChange(ev.target.value);
    }

    function getBubblePosition() {
        if (option === options[0]) {
            return "translate-x-[2px] w-[100px] bg-red-200";
        } else if (option === options[1]) {
            return "translate-x-[102px] w-[100px] bg-orange-300";
        } else {
            return "translate-x-[204px] w-[100px] bg-green-300";
        }
    }

    return (
        <>
            <div className="wrapper flex  w-fit border dark:border-white/60 h-8 rounded-full relative">
                <div
                    className={`bubble z-0 transition duration-200 rounded-full top-[2px] h-[26px] absolute ${getBubblePosition()}`}
                ></div>
                <div className="container flex w-[306px] justify-between items-center font-bold z-10  text-xs leading-8 uppercase dark:text-white/60">
                    <label className="flex w-[100px] items-center justify-center grow cursor-pointer">
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[0]}
                            checked={option === options[0]}
                            onChange={(ev) => handleOnChange(ev)}
                        />
                        <span
                            className={
                                option === options[0] ? "text-red-600" : ""
                            }
                        >
                            {options[0]}
                        </span>
                    </label>

                    <label className="flex w-[100px] items-center justify-center grow cursor-pointer">
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[1]}
                            checked={option === options[1]}
                            onChange={(ev) => handleOnChange(ev)}
                        />
                        <span
                            className={
                                option === options[1] ? "text-slate-900" : ""
                            }
                        >
                            {options[1]}
                        </span>
                    </label>

                    <label className="flex w-[100px] items-center justify-center grow cursor-pointer">
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[2]}
                            checked={option === options[2]}
                            onChange={(ev) => handleOnChange(ev)}
                        />
                        <span
                            className={
                                option === options[2] ? "text-slate-900" : ""
                            }
                        >
                            {options[2]}
                        </span>
                    </label>
                </div>
            </div>
        </>
    );
}

export default Switch;
