import {getProxy, sleep} from "../utils/common"
import axios from "axios";
import {log} from "../utils/logger";
import {projectConfig} from "../data/project.config";
import {IProxy} from "../utils/wallet";


export async function getAuthData(proxy: IProxy | boolean, attempts: number = 0): Promise<any> {
    try {
        const response = await axios.get("https://alpha-api.satworld.io/basic/login/sign-content");
        return response.data.data;
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return getAuthData(proxy, attempts + 1);
        } else {
            log("error", `Failed to fetch auth data after [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}

export async function makeAuth(address: string, publicKey: string, signMsg: string, signRes: string, proxy: IProxy | boolean, attempts: number = 0) {
    const body = {
        "address": address,
        "pubKey": publicKey,
        "signContent": signMsg,
        "signRes": signRes
    }

    log("info", `Try authorize wallet on Uniworlds | ${address}`)

    try {
        const response = await axios.post(
            "https://alpha-api.satworld.io/basic/login",
            body,
            {
                httpsAgent: getProxy(proxy),
                httpAgent: getProxy(proxy),
                headers: {"avatarversion": "v0.3.2"}
            }
        );
        return response.data
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return makeAuth(address, publicKey, signMsg, signRes, proxy, attempts + 1);
        } else {
            log("error", `Failed to fetch auth data after [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}


export async function makePlant(address: string, session: string, turnstile: string, proxy: IProxy | boolean, attempts: number = 0) {
    try {
        const response = await axios.post(
            "https://alpha-api.satworld.io/temp-avatar/plant-potato",
            {},
            {
                httpsAgent: getProxy(proxy),
                httpAgent: getProxy(proxy),
                headers: {"session": session, "turnstile": turnstile, "address": address, "avatarversion": "v0.3.2"}
            }
        );
        return response.data
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return makePlant(address, session, turnstile, proxy, attempts + 1);
        } else {
            log("error", `Failed to make plant potato [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}


export async function makeClaim(address: string, session: string, proxy: IProxy | boolean, attempts: number = 0) {
    try {
        const response = await axios.post(
            "https://alpha-api.satworld.io/temp-avatar/claim-potato",
            {},
            {
                httpsAgent: getProxy(proxy),
                httpAgent: getProxy(proxy),
                headers: {"session": session, "address": address, "avatarversion": "v0.3.2"}
            }
        );
        return response.data
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return makeClaim(address, session, proxy, attempts + 1);
        } else {
            log("error", `Failed to claim potato [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}


export async function addAvatar(address: string, session: string, content: string, proxy: IProxy | boolean, attempts: number = 0) {
    try {
        const response = await axios.post(
            "https://alpha-api.satworld.io/temp-avatar/add",
            {"content": content},
            {
                httpsAgent: getProxy(proxy),
                httpAgent: getProxy(proxy),
                headers: {"session": session, "address": address, "avatarversion": "v0.3.2"}
            }
        );
        return response.data
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return addAvatar(address, session, content, proxy, attempts + 1);
        } else {
            log("error", `Failed to add avatar [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}


export async function createTask(address: string, attempts: number = 0) {
    const body = {
        "clientKey": projectConfig.apiKey,
        "task": {
            "type": "TurnstileTaskProxyless",
            "websiteURL": "https://alpha.satworld.io/",
            "websiteKey": "0x4AAAAAAA2S2QoS838whqiC"
        }
    }

    log("info", `Try create task on 2captcha | ${address}`)

    try {
        const response = await axios.post(
            "https://api.2captcha.com/createTask",
            body,
        );
        return response.data
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return createTask(address, attempts + 1);
        } else {
            log("error", `Failed to fetch create task data after [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}


async function getTaskResult(address: string, taskId: number, attempts: number = 0) {
    const body = {
        "clientKey": projectConfig.apiKey,
        "taskId": taskId
    }

    log("info", `Try get task data on 2captcha | ${address}`)

    try {
        const response = await axios.post(
            "https://api.2captcha.com/getTaskResult",
            body,
        );
        return response.data
    } catch (error) {
        if (attempts < projectConfig.retryCount) {
            log("error", `Attempt [${attempts + 1}/${projectConfig.retryCount}] failed: ${(error as Error).message}. Retrying...`);
            return getTaskResult(address, taskId, attempts + 1);
        } else {
            log("error", `Failed to fetch get task data after [${attempts + 1}/${projectConfig.retryCount}] attempts.`);
        }
    }
}


export async function fetchTaskSolution(address: string, taskId: number, attempts: number = 0) {
    const maxAttempts = projectConfig.retryCount

    try {
        const result = await getTaskResult(address, taskId)

        if (result.status === "processing") {
            log("info", `Task is still processing. Attempt ${attempts + 1}/${maxAttempts}. Retrying in 5 seconds...`)
            await sleep([5, 5])
            return fetchTaskSolution(address, taskId, attempts + 1);
        } else if (result.status === "ready") {
            log("info", `Task completed successfully.`);
            return result.solution.token;
        } else {
            throw new Error(`Unexpected status: ${result.status}`);
        }
    } catch (error) {
        if (attempts < maxAttempts - 1) {
            log("error", `Attempt [${attempts + 1}/${maxAttempts}] failed: ${(error as Error).message}. Retrying...`);
            return fetchTaskSolution(address, taskId, attempts + 1);
        } else {
            log("error", `Failed to fetch task solution after ${maxAttempts} attempts.`);
            throw new Error(`Failed to fetch task solution: ${(error as Error).message}`);
        }
    }
}

