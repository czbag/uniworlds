import * as bitcoin from "bitcoinjs-lib";
import * as bitcoinMessage from "bitcoinjs-message";
import {initEccLib, networks} from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import * as bip39 from "bip39";
import BIP32Factory, {type BIP32Interface} from "bip32";
import ECPairFactory, {type ECPairInterface, Signer} from "ecpair";

initEccLib(ecc);

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export interface IProxy {
    ip: string;
    port: number;
    username: string;
    password: string;
}

interface IWallet {
    seed: string;
    proxy: IProxy | boolean;
}

export class Wallet {
    private path = "m/86'/0'/0'/0/0";
    public network: bitcoin.networks.Network = networks.bitcoin;
    public ecPair: ECPairInterface;
    public address: string;
    public output: Buffer;
    public publicKey: string;
    private bip32: BIP32Interface | undefined;
    public proxy: IProxy | boolean;
    public session: string | null;

    constructor(walletParam: IWallet) {
        const connect = walletParam.seed;
        this.proxy = walletParam.proxy;

        if (bip39.validateMnemonic(connect)) {
            if (!bip39.validateMnemonic(connect)) {
                throw new Error("invalid mnemonic");
            }

            this.bip32 = bip32.fromSeed(
                bip39.mnemonicToSeedSync(connect),
                this.network
            );
            this.ecPair = ECPair.fromPrivateKey(
                this.bip32.derivePath(this.path).privateKey!,
                {network: this.network}
            );
        } else {
            this.ecPair = ECPair.fromWIF(connect, this.network);
        }
        const {address, output} = bitcoin.payments.p2tr({
            internalPubkey: this.ecPair.publicKey.subarray(1, 33),
            network: this.network,
        });
        this.address = address as string;
        this.output = output as Buffer;
        this.publicKey = this.ecPair.publicKey.toString("hex");
        this.session = null;

    }

    signMessage(message: string) {
        const signature = bitcoinMessage.sign(message, this.ecPair.privateKey!, this.ecPair.compressed)
        return signature.toString('base64')
    }

}

