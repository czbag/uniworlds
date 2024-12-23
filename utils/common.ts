import * as fs from 'fs';
import {select} from "@inquirer/prompts";
import {projectConfig} from "../data/project.config";
import {log} from "./logger";
import {IProxy} from "./wallet";
import {SocksProxyAgent} from "socks-proxy-agent";

export async function menu() {
    console.log("❤️ Subscribe to me – https://t.me/sybilwave\n");

    const answer = await select(
        {
            message: "💎 Select a method to get started",
            choices: [
                {
                    name: "1) Create avatar",
                    value: "create_avatar",
                },
                {
                    name: "2) Plant potato",
                    value: "plant_potato",
                },
                {
                    name: "3) Claim potato",
                    value: "claim_potato",
                },
                {
                    name: "4) Exit",
                    value: "exit",
                },
            ],
        }
    );

    return answer;
}

export function getFormattedDate(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function readFile(filePath: string): string[] {
    try {
        const file = fs.readFileSync(filePath, 'utf-8');
        return file.split('\n').map(line => line.trim()).filter(line => line);
    } catch (error) {
        log("error", `Error reading the file: ${(error as Error).message}`);
        return [];
    }
}

export function matchWalletsAndProxies(wallets: string[], proxies: string[]) {
    const walletProxyMap: { [wallet: string]: IProxy | boolean } = {};

    if (projectConfig.useProxy) {
        for (let i = 0; i < wallets.length; i++) {
            const proxyParts = proxies[i].split(':');
            walletProxyMap[wallets[i]] = {
                ip: proxyParts[0],
                port: parseInt(proxyParts[1], 10),
                username: proxyParts[2],
                password: proxyParts[3]
            };
        }
    } else {
        wallets.forEach(wallet => {
            walletProxyMap[wallet] = false; // Если прокси не используется, ставим `false`
        });
    }

    return walletProxyMap
}

export async function sleep(seconds: number[]): Promise<void> {
    const sleep_seconds = Math.floor(Math.random() * (seconds[1] - seconds[0] + 1)) + seconds[0];
    return new Promise(resolve => setTimeout(resolve, sleep_seconds * 1000));
}

export function getProxy(proxy: IProxy | boolean) {
    if (proxy && typeof proxy !== 'boolean') {
        const proxyUrl = `socks5://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
        return new SocksProxyAgent(proxyUrl)
    }
}

export function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}