"use client"
import React from 'react'
import Image from 'next/image'

export default function Sidebar() {
    return (
        <div className='h-full w-14 fixed border-r hover:w-48 transition-all duration-100 shadow-lg z-20 group bg-white'>
            <nav className='h-full flex  flex-col justify-between overflow-y-auto py-2'>
                <ul className='flex flex-col gap-y-1 justify-start px-2 relative'>

                    <li className='hover:bg-gray-100 rounded-md h-10 min-w-10 flex items-center'>
                        <div className='p-[6px] flex items-center gap-x-2 cursor-pointer'>
                            <Image src="/Hierarchy.png" alt="logo" width={25} height={25} />
                            <p className={`text-sm hidden group-hover:flex transition-all duration-300`}>Hierarchy</p>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
