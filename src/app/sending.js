"use client"
import TonWeb from 'tonweb';

const tonweb = new TonWeb(); // Initialize TonWeb

// Wallet setup (example using mnemonic)
const wallet = tonweb.wallet.create({
    publicKey: 'your-public-key-here'
});

// Function to send tokens
export async function sendTokens(amount, recipientAddress) {
    try {
        const walletContract = wallet.deployContract({
            amount: TonWeb.utils.toNano('0.01') // Amount to deploy the contract with
        });

        // Transfer tokens
        await walletContract.methods.transfer({
            to: recipientAddress,
            amount: TonWeb.utils.toNano(amount),
            seqno: (await wallet.methods.getSeqno()).toNumber()
        }).send();

        console.log('Tokens transferred successfully');
    } catch (error) {
        console.error('Error transferring tokens:', error);
    }
}

// Call this function when the game is over
export function handleGameOver(finalScore) {
    // Define the token amount based on the score (you can adjust this logic)
    const tokenAmount = finalScore / 1000; // Example: 1 token for every 1000 points

    const recipientAddress = 'recipient-wallet-address-here'; // Replace with the actual address

    sendTokens(tokenAmount, recipientAddress);
}