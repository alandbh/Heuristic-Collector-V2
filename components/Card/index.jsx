import Image from "next/image";
import Link from "next/link";
import React from "react";

// import { Container } from './styles';

function Card({ data }) {
    return (
        <div className="max-w-[300px] transition-shadow rounded overflow-hidden shadow-md hover:shadow-xl dark:bg-slate-800">
            <Link href={`/project/${data.slug}`}>
                <a>
                    <Image
                        className="w-full"
                        height={200}
                        width={300}
                        objectFit="cover"
                        src={data.thumbnail.url}
                        alt=""
                    />
                    <div className="px-6 py-4">
                        <div className="font-bold dark:text-white/70 text-xl mb-2">
                            {data.name}
                        </div>
                        <div className="text-md dark:text-white/50">
                            {data.year}
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    );
}

export default Card;
