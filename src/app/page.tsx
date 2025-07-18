import React from 'react'
import NotesApp from '@/components/home'
import { WalletButton } from '@/components/solana/solana-provider'
const page = () => {
  return (
    <div className="min-h-screen px-20 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-8">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">📝 Take Notes App</h1>
          <WalletButton />
        </div>
        <NotesApp />

      </div>

    </div >

  )
}

export default page