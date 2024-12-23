import {IProxy, Wallet} from "../utils/wallet";
import {log} from "../utils/logger";
import {createTask, fetchTaskSolution, makeAuth, makeClaim, makePlant,} from "./uniworlds";
import {getFormattedDate} from "../utils/common";


export async function makePlantPotato(walletProxyMap: { [wallet: string]: IProxy | boolean }): Promise<void> {
    for (const walletData in walletProxyMap) {
        const wallet = new Wallet({seed: walletData, proxy: walletProxyMap[walletData]});

        if (wallet.session === null) {
            const formattedDate = getFormattedDate();

            let signMsg = `Welcome to uniworlds' avatar system. \naddress: ${wallet.address} \nOperation time: ${formattedDate}`

            const sign = wallet.signMessage(signMsg)

            const status = await makeAuth(wallet.address, wallet.publicKey, signMsg, sign, wallet.proxy)

            if (status?.msg === "ok") {
                wallet.session = status.data.sessionId
            } else {
                continue
            }
        }

        const result = await createTask(wallet.address)

        const captcha = await fetchTaskSolution(wallet.address, result.taskId)

        const status = await makePlant(wallet.address, wallet.session as string, captcha, wallet.proxy)

        if (status.msg === "ok") {
            log("info", `Plant potato is successfully! | ${wallet.address}`)
        } else{
            log("error", `Error plant potato: ${status.msg} | ${wallet.address}`)
        }

    }
}


export async function claimPotato(walletProxyMap: { [wallet: string]: IProxy | boolean }): Promise<void> {
    for (const walletData in walletProxyMap) {
        const wallet = new Wallet({seed: walletData, proxy: walletProxyMap[walletData]});

        if (wallet.session === null) {
            const formattedDate = getFormattedDate();

            let signMsg = `Welcome to uniworlds' avatar system. \naddress: ${wallet.address} \nOperation time: ${formattedDate}`

            const sign = wallet.signMessage(signMsg)

            const status = await makeAuth(wallet.address, wallet.publicKey, signMsg, sign, wallet.proxy)

            if (status?.msg === "ok") {
                wallet.session = status.data.sessionId
            } else {
                continue
            }
        }

        const status = await makeClaim(wallet.address, wallet.session as string, wallet.proxy)

        if (status.msg === "ok") {
            log("info", `Claim potato is successfully! | ${wallet.address}`)
        } else{
            log("error", `Error plant potato: ${status.msg} | ${wallet.address}`)
        }

    }
}
