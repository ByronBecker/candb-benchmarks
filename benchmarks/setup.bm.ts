import { execSync } from "child_process";
import canisterIds from "../.dfx/local/canister_ids.json";
import { readFileSync, writeFileSync } from "fs";
import { XDR } from "../src/xdr";

const stdio = process.env.DEBUG ? "inherit" : "ignore";

export const SDR = 1.35;
export var cyclesPerICP = 0;
export var priceICPInUSD = 0;

before(async () => {
    const { data } = await XDR.get_icp_xdr_conversion_rate();
    cyclesPerICP = Number(data.xdr_permyriad_per_icp) * 1_000_000_000_000_000;
    const cyclesPerICPInT = parseFloat(data.xdr_permyriad_per_icp.toString()) / 10_000;
    console.log(`XDR: ${cyclesPerICPInT}T Cycles/ICP.`);

    priceICPInUSD = cyclesPerICPInT * SDR;
    console.log(`ICP: ${priceICPInUSD} USD.`);
    console.log("\n\n");
    
    execSync(`dfx stop`, { stdio: "ignore" });
    execSync(`dfx start --background --clean`, { stdio });
    execSync(`dfx deploy`, { stdio });
    execSync(`dfx generate`, { stdio });

    // Remove the last line of each index.js file.
    for (const k of Object.keys(canisterIds)) {
        if (k.startsWith("__")) continue;
        const filePath = "src/declarations/" + k + "/index.js";
        const index = readFileSync(filePath, "utf-8").split("\n");
        writeFileSync(filePath, index.slice(0, -2).join("\n"))
    };
});

after(() => {
    execSync(`dfx stop`, { stdio: "ignore" });
});