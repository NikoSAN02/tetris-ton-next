"use client"
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './Tetriss.module.css'; // Adjust the path as needed

// Dynamically import Tetris with no SSR
const Tetris = dynamic(() => import('react-tetris'), { ssr: false });

const Tetriss = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set to true only on the client side
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>; // Or any other loading indication
  }

  return (
    <div>
      <h1>Tetris</h1>
      <div className={styles.gameContainer}>
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
              <div className={styles.gameInfo}>
                <p>Points: {points}</p>
                <p>Lines Cleared: {linesCleared}</p>
              </div>
              <div className={styles.gameElements}>
                <HeldPiece />
                <Gameboard />
                <PieceQueue />
              </div>
              {state === 'LOST' && (
                <div className={styles.gameOver}>
                  <h2>Game Over</h2>
                  <button onClick={controller.restart}>New game</button>
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
