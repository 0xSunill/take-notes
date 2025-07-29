'use client';

import { FC } from 'react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import WalletButton from '@/lib/WalletMultiButton';
import Link from 'next/link';

import '@solana/wallet-adapter-react-ui/styles.css';

const Nav: FC = () => {

    return (
        <nav className="absolute top-0 right-0 left-0 w-full flex justify-between items-center px-10 py-4 bg-gray-900 text-white shadow-md">
            <Link href="/" className="text-2xl font-bold tracking-wide text-yellow-400 hover:text-yellow-300 transition duration-200">
                keep Notes
            </Link>

            <div className="flex items-center space-x-4">
                <WalletButton />
            </div>
        </nav>
    );
};

export default Nav;