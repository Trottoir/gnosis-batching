import {createSafeClient} from "@safe-global/sdk-starter-kit";
import {Contract, JsonRpcProvider} from "ethers";
import * as poolAbi from "./abis/stablePoolCurve.json";
import "dotenv/config";

export async function main() {
    const provider = new JsonRpcProvider(process.env.RPC_URL!);
    // /!\ Change the LP address
    const lpAddress = "0x4dece678ceceb27446b35c672dc7d61f30bad69e";

    const lp = new Contract(lpAddress, poolAbi, provider);
    // /!\ Change the token address
    const token = new Contract("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", poolAbi, provider);

    // Find out which coin is the coin we want to add
    const indexToken = (await lp.coins(0)).toUpperCase() === (await token.getAddress()).toUpperCase() ? 0 : 1;

    // Prepare the parameters to input
    // /!\ Swaps the whole balance of the Safe
    const tokenBalanceOfSafe = await token.balanceOf(process.env.SAFE_ADDRESS!);
    const amounts = indexToken === 0 ? [tokenBalanceOfSafe, 0] : [0, tokenBalanceOfSafe];
    const quote = await lp.calc_token_amount(amounts, false);

    const minValue = quote - (quote * 3n) / 10_000n; // 0.03% slippage max
    const params = [amounts, minValue];

    const data = lp.interface.encodeFunctionData("add_liquidity(uint256[2],uint256)", params);

    const transactions = [
        {
            to: lpAddress,
            data,
            value: "0",
        },
    ];

    console.log(transactions);

    // const safeClient = await createSafeClient({
    //     provider: process.env.RPC_URL!,
    //     signer: process.env.SIGNER_PRIVATE_KEY!,
    //     safeAddress: process.env.SAFE_ADDRESS!,
    // });

    // await safeClient.send({transactions});
}
main();
