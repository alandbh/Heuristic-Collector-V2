import Image from "next/image";
import Link from "next/link";
import React from "react";

// import { Container } from './styles';

function Card({ data }) {
    return (
        <div className="max-w-[300px] transition-shadow rounded overflow-hidden shadow-md hover:shadow-xl">
            <Link href={`/project/${data.slug}`}>
                <a>
                    <Image
                        className="w-full"
                        height={200}
                        width={300}
                        src={data.thumbnail.url}
                        alt=""
                    />
                    <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">
                            {data.name}
                        </div>
                    </div>
                </a>
            </Link>
        </div>
    );
}

export default Card;
