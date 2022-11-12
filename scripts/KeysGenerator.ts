import * as bip39 from "bip39";


export const mnemonic: string = bip39.generateMnemonic();
console.log({mnemonic})


