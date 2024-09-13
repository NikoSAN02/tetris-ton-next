"use client"
import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './Tetriss.module.css';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import axios from 'axios';
import TonConnect from '@tonconnect/sdk';
import { Address, beginCell, toNano } from 'ton-core';

// TonConnect initialization
const connector = new TonConnect({
  manifestUrl: 'http://localhost:3000', // URL to your app's manifest.json
});



// Jetton master contract address
const JETTON_MASTER_ADDRESS = 'kQAjsNKgpZNi2cZ2mOxtfEMhivMPyxmBgedqHQKCoNNYJ_FL'; // Replace with your jetton master address
// Your wallet address (where the jettons are stored)
const OWNER_ADDRESS = '0QChwMiVBtJA0RmYdGjKuTAm0OIQnDYoMVpI7bYRUPzh_aqS'; // Replace with your wallet address

async function claimJettons(amount) {
  if (!connector.connected) {
    console.error('Wallet not connected');
    return;
  }

  const userAddresss = "0QD8wp0fikBLUdqvdb3czWXCe_t78cuJrEKrteaussL7I7Zk";
  console.log(userAddresss);
  // Construct the jetton transfer message
  const payload = beginCell()
      .storeUint(0x0f8a7ea5, 32) // op code for jetton transfer
      .storeUint(0, 64) // query id
      .storeCoins(amount) // amount of jettons to transfer
      .storeAddress(Address.parse(userAddresss)) // recipient address
      .storeAddress(Address.parse(userAddresss)) // response destination
      .storeUint(0, 1) // custom payload
      .storeCoins(toNano('0.01')) // forward amount
      .storeUint(0, 1) // forward payload
      .endCell()
      .toBoc()
      .toString('base64');

  const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 seconds from now
      messages: [
          {
              address: JETTON_MASTER_ADDRESS,
              amount: toNano('0.05').toString(), // 0.05 TON for gas
              payload: payload,
          },
      ],
  };

  try {
      const result = await connector.sendTransaction(transaction);
      console.log('Transaction sent:', result);
  } catch (e) {
      console.error('Failed to send transaction:', e);
  }
}


const jettonAmount = BigInt(100 * 10**9); // 100 jettons (assuming 9 decimals)

const Tetris = dynamic(() => import('react-tetris'), { ssr: false });


const Tetriss = () => {
  const [claimingTokens, setClaimingTokens] = useState(false);

  const userAddress = useTonAddress();
  
  
  
  

  return (
    <div className='p-4 w-full flex flex-col gap-5'>
      <h1 className='h-full w-full text-5xl text-center font-bold'>Tetris</h1>
      <div className='flex flex-col gap-5 w-full'>
        <Tetris
          keyboardControls={{
            down: 'MOVE_DOWN',
            left: 'MOVE_LEFT',
            right: 'MOVE_RIGHT',
            space: 'HARD_DROP',
            z: 'FLIP_COUNTERCLOCKWISE',
            x: 'FLIP_CLOCKWISE',
            up: 'FLIP_CLOCKWISE',
            p: 'TOGGLE_PAUSE',
            c: 'HOLD',
            shift: 'HOLD'
          }}
        >
          {({
            HeldPiece,
            Gameboard,
            PieceQueue,
            points,
            linesCleared,
            state,
            controller
          }) => (
            <>
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg ml-4 border border-gray-700 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-bold mb-3 text-center text-blue-300">Game Stats</h3>
                <div className="flex justify-between">
                  <div className="text-center px-2">
                    <p className="text-sm uppercase text-gray-400">Points</p>
                    <p className="text-2xl font-bold text-yellow-400 animate-pulse">{points.toLocaleString()}</p>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm uppercase text-gray-400">Lines Cleared</p>
                    <p className="text-2xl font-bold text-green-400 animate-pulse">{linesCleared}</p>
                  </div>
                </div>
              </div>

              <div className='flex gap-10 w-full items-center justify-center'>
                <HeldPiece />
                <Gameboard />
                <PieceQueue />
              </div>

              <div className="flex justify-center gap-4 mt-5">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    if (state === 'PAUSED') {
                      controller.resume();
                    } else {
                      controller.pause();
                    }
                  }}
                >
                  {state === 'PAUSED' ? 'Resume' : 'Pause'}
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={controller.restart}
                >
                  Restart
                </button>
              </div>

              {state === 'LOST' && (
                <div className="game-over absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                  <div className="text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Game Over</h2>
                    <button
                      className="button bg-red-400 text-white border-none px-4 py-2 cursor-pointer hover:bg-orange-400 mr-2"
                      onClick={controller.restart}
                    >
                      New Game
                    </button>
                    <button
                      className="button bg-red-400 text-white border-none px-4 py-2 cursor-pointer hover:bg-orange-400"
                      onClick={() => claimJettons(jettonAmount)}
                      disabled={claimingTokens}
                    >
                      {claimingTokens ? 'Claiming...' : 'Claim Tokens'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Tetris>
      </div>
    </div>
  );
};

export default Tetriss;