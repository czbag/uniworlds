import {IProxy, Wallet} from "../utils/wallet";
import {log} from "../utils/logger";
import {addAvatar, makeAuth} from "./uniworlds";
import {getFormattedDate} from "../utils/common";


type Avatar = {
    [key: string]: string[];
};

function generateContent(avatar: Avatar): string {
    function getRandomItem(array: string[]): string {
        return array[Math.floor(Math.random() * array.length)];
    }

    const content: { [key: string]: string } = {};

    const actionId = getRandomItem(avatar.action);
    if (actionId) {
        content.actionId = actionId;
    }

    content.shirtId = getRandomItem(avatar.shirt);
    content.pantsId = getRandomItem(avatar.pants);
    content.shoesId = getRandomItem(avatar.shoes);
    content.hatId = getRandomItem(avatar.head);

    return JSON.stringify(content);
}


export async function makeAvatar(walletProxyMap: { [wallet: string]: IProxy | boolean }): Promise<void> {
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

        const avatar: Avatar = {
            shirt: [
                "b4b441be936517ea8dc5693b52e2a57677a1026bc269566c4535adb815ab5167i0",
                "af000645b3720977c883b9b0f79cbf4d038d9496f3a19ffb3ef4dd028bf74f83i0",
                "e09d3124a6c939c9ef639ba33d740aeba798a5268f138a63e213de4dd1832afai0",
                "1715209b7af75221ab5985cf5e86e765e290456e4b78e7612efea440cccf47d5i0",
                "20ad24644d2603fc480fdb3c036ff8fd5dd05e84f05b73b1792045eede0e89e1i0",
                "055f99f87af80246cb9e47eda70fc44a3351882f4f7544dfc63d83855b67eef5i0",
                "22231130f321b97b4ed3ab9efa69cca849685d9cc7d25c666ac175c0448ce19ei0"
            ],
            pants: [
                "f410ad3f103c2ada0ef5ccd13453fdc52d144f0e483b059caa5d78dbf3d470bei0",
                "155b4640681b206120e22f12e184d87319e89b8f5b104543f4d448012cff1d98i0",
                "c3cb25fc00e818dad6eba94b078a4d5b7b4a19c0989f7e6640d7b8589cac75c9i0",
                "1f06c13e2d59c60e0a623c7bda7bd2db15ee33aaffb941c62033edc9ac35e37ci0",
                "15bdd29d4c607d052c54fd71a2694c289bc7a5187e0b79272128d4cf337a2d8di0",
                "f6623c4f121dafbd729140688ad4e7e7dbff2e348e94e9db3a9c3d040b16b5fbi0",
                "0f95d041ae575573e72a22a755aa27dabf1190fb3aab1f5c86d71d0344fa9a6ei0",
            ],
            shoes: [
                "1cdc553654f63978b68f5f7a61a001f44e7d4f368dfb33b3e9e946652f9c5a5bi0",
                "1461c5accc8b321f37fb25bf5a87c55c008926ad1375ba318d7e730498ad49e1i0",
                "ecb3037b9ebdd6d0d1cc35dcb4444529fb67dc91c0bfca39f8ef54adec930544i0",
                "18d6a97dcb08f9f6a17243b445d415d087520292d2cca6339f75c252321649a2i0",
                "e4baa7c58c09dce599afd7d0531cc83a74b996892b4081b3659338fec0a7cc2fi0",
                "4311f1cdbe6b41a31504fbd00780b926a0bb95d0118262d948f238bd2f407da8i0",
                "4b92f48cb55d4b4fa5451b27a555ab49e4942ce73af124cda83a97dc4a87bd1ai0",
            ],
            head: [
                "ecdb22a670cfa6472b58a49ffb859acdc850869682616724835861c7f3aa3c91i0",
                "f4fdc36978980da9fdd3628a30201d20f500a63eb186dfdca830598fd97cd25fi0",
                "2fb9d77acc6c7b892bc8d1b476f4d42739f61e00f7a8cdf9c423e1ed62b88b77i0",
                "8aed70f75649f4815edc3bee38b44ae0873b7b7d5f1aab1cef6e912263ea8687i0",
                "8c8b37efac3b07af6966beb960459f9656cc7a3f635d29929249eae7dcfb4fc2i0",
                "e3ec72a4c8462e55648d21278924ca720821fb45c57d0fe035208ace096f032ci0",
            ],
            action: [
                "de750b12cf071b0cbaebd22c905c4954f3499cfe7c4fad1ce0e1363e84e565f1i0",
                "35e122e7cbed174b187003127888a7b51fe45ee84b43181d8f14b50be5b5eb2bi0",
                "8ff02c579c42a5b321fc82b7069612341fb026eea2507e7bbe6335039138830ei0",
                "bfbd169e95be3887342a7064fd0438546204fa29c62ddf39ee06e2ff2d785e2ei0",
                "",
            ]
        }

        const generatedContent = generateContent(avatar);

        const status = await addAvatar(wallet.address, wallet.session as string, generatedContent, wallet.proxy)

        if (status.msg === "ok") {
            log("info", `Create avatar is successfully! | ${wallet.address}`)
        } else{
            log("error", `Error create avatar: ${status.msg} | ${wallet.address}`)
        }
    }
}

