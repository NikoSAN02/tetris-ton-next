"use client"
import React from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import { useTonWallet } from '@tonconnect/ui-react';
function Header() {
  return (
    <>
    <div className='w-full h-auto flex items-center justify-center'>
         <TonConnectButton />
        </div>
    </>

  )
}

export default Header