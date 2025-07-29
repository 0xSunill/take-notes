
'use client'

import dynamic from 'next/dynamic';


const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false } // 👈 disables SSR, only renders on client
);

export default function WalletButton() {
  return <WalletMultiButton />;
}