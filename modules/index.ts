import {matchWalletsAndProxies, menu, readFile, shuffleArray} from "../utils/common";
import {makeAvatar} from "./avatar";
import {projectConfig} from "../data/project.config";
import {log} from "../utils/logger";
import {IProxy} from "../utils/wallet";
import {claimPotato, makePlantPotato} from "./potato";


async function runModule(walletProxyMap: { [wallet: string]: IProxy | boolean  }, callback: (wallets: { [wallet: string]: IProxy | boolean  }) => Promise<void>): Promise<void> {
    const wallets = Object.keys(walletProxyMap);
    const batchSize = projectConfig.batchCount;
    const batchSleep = projectConfig.batchSleep;

    const batchPromises = Array.from({ length: Math.ceil(wallets.length / batchSize) }, (_, i) => {
        const startIndex = i * batchSize;
        const endIndex = Math.min(startIndex + batchSize, wallets.length);
        const batch = wallets.slice(startIndex, endIndex);

        const sleepTime = Math.floor(Math.random() * (batchSleep[1] - batchSleep[0] + 1)) + batchSleep[0];

        const batchWalletProxyMap: { [wallet: string]: IProxy | boolean  } = {};
        batch.forEach(wallet => {
            batchWalletProxyMap[wallet] = walletProxyMap[wallet];
        });

        return new Promise<void>(async (resolve) => {
            await new Promise(resolveTimeout => setTimeout(resolveTimeout, i * sleepTime * 1000));
            await callback(batchWalletProxyMap);
            resolve();
        });
    });

    await Promise.all(batchPromises);
}


async function index(): Promise<void> {
    const wallets = shuffleArray(readFile("wallets.txt"));
    const proxies = readFile("proxy.txt");

    const walletProxyMap = matchWalletsAndProxies(wallets, proxies)

    const mode = await menu();

    if (projectConfig.useProxy && wallets.length != proxies.length) {
        log("error", "Unable to map wallets to proxies");
        log("info", "\n🤑 Donate me: \nEVM: 0x00000b0ddce0bfda4531542ad1f2f5fad7b9cde9\nBTC: bc1p0mhv0d3ywqja49gnzhusxmxxkzhn4zhew6k6z4rn0gjcytluhkhq3uhq5z");
        process.exit(1);
    }

    switch (mode) {
        case "create_avatar":
            await runModule(walletProxyMap, makeAvatar);
            break;
        case "plant_potato":
            await runModule(walletProxyMap, makePlantPotato);
            break;
        case "claim_potato":
            await runModule(walletProxyMap, claimPotato);
            break;
        case "exit":
            log("info", "\n🤑 Donate me: \nEVM: 0x00000b0ddce0bfda4531542ad1f2f5fad7b9cde9\nBTC: bc1p0mhv0d3ywqja49gnzhusxmxxkzhn4zhew6k6z4rn0gjcytluhkhq3uhq5z");
            process.exit(1);
    }

    log("info", "\n🤑 Donate me: \nEVM: 0x00000b0ddce0bfda4531542ad1f2f5fad7b9cde9\nBTC: bc1p0mhv0d3ywqja49gnzhusxmxxkzhn4zhew6k6z4rn0gjcytluhkhq3uhq5z");
}

if (require.main === module) {
    index().catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
}
