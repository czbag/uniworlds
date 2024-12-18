import axios from "axios";
import {projectConfig} from "../data/project.config";
import {log} from "../utils/logger";
import {getProxy} from "../utils/common";
import {IProxy} from "../utils/wallet";

export async function fetchFees(proxy: IProxy | boolean, attempts: number = 0) {
    const axiosConfig: any = {
        httpsAgent: getProxy(proxy),
        httpAgent: getProxy(proxy),
    };

    try {
        const response = await axios.get(`https://mempool.fractalbitcoin.io/api/v1/fees/recommended`, axiosConfig);

        const fee = projectConfig.feesUsing;

        const acceptFees: { [key: string]: string } = {
            "slow": "minimumFee",
            "medium": "economyFee",
            "fast": "fastestFee",
        };

        return response.data[acceptFees[fee]];
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return fetchFees(proxy, attempts + 1);
        } else {
            log("error", `Failed to fetch auth data after [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}
