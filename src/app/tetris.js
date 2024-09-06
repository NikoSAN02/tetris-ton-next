"use client"
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './Tetriss.module.css'; // Adjust the path as needed
import { sendTokens } from './sending';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import TonWeb from 'tonweb';

// Dynamically import Tetris with no SSR
const Tetris = dynamic(() => import('react-tetris'), { ssr: false });
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));
const Tetriss = () => {
  const [isClient, setIsClient] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  useEffect(() => {
    // Set to true only on the client side
    setIsClient(true);
  }, []);
  
  const handleSendTokens = async (points) => {
    if (!tonConnectUI.connected) {
      console.error('Wallet not connected');
      return;
    }

    const tokenAmount = points / 1; // 1 token for every 1000 points

    try {
      // Create a wallet instance
      const wallet = tonweb.wallet.create({ address: userAddress });

      // Get the current seqno
      const seqno = await wallet.methods.seqno().call();

      // Prepare the transaction
      const transaction = await wallet.methods.transfer({
        secretKey: new Uint8Array(32), // This should be the user's secret key, but we don't have access to it
        toAddress: userAddress,
        amount: TonWeb.utils.toNano(tokenAmount.toString()),
        seqno: seqno,
        payload: 'Tetris Reward',
        sendMode: 3,
      }).getQuery();

      // Convert the transaction to BOC (Bag of Cells) format
      const boc = TonWeb.utils.bytesToBase64(await transaction.toBoc(false));

      // Send the transaction using TonConnect
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60 * 20, // Valid for 20 minutes
        from: userAddress,
        network: 'testnet', // or 'testnet' if you're using testnet
        messages: [
          {
            address: userAddress,
            amount: TonWeb.utils.toNano(tokenAmount.toString()),
            payload: boc,
          },
        ],
      });

      console.log('Transaction sent:', result);
      // Add user feedback here (e.g., success message)
    } catch (error) {
      console.error('Failed to send transaction:', error);
      // Add user feedback here (e.g., error message)
    }
  };

  if (!isClient) {
    return <div>Loading...</div>; // Or any other loading indication
  }

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
                    controller.resume(); // Resume the game if it's paused
                  } else {
                    controller.pause(); // Pause the game if it's running
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
                      className="button bg-red-400 text-white border-none px-4 py-2 cursor-pointer hover:bg-orange-400"
                      onClick={controller.restart}
                    >
                      New Game
                    </button>
                    <button
                      className="button bg-red-400 text-white border-none px-4 py-2 cursor-pointer hover:bg-orange-400"
                      onClick={() => handleSendTokens(points)}
                    >
                      claim
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
