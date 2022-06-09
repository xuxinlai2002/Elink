#! /bin/bash
account=""
bootnodev4url=""

if [ ! -d "./logs" ];then
mkdir ./logs
fi

while read line
do
    account=$line
    break
done < ./account.txt

./geth --datadir "./data"  init "./ethconfig.json"

nohup ./geth --datadir "./data" \
      --mine \
      --rpc --rpcvhosts '*' --rpcaddr "127.0.0.1" --port 5111 --rpcport 6111 \
      --rpccorsdomain "*" \
      --rpcapi "personal,db,eth,net,web3,txpool,miner,admin,trace" \
      --allow-insecure-unlock \
      --unlock "$account" \
      --password "./pass.txt" \
      --black.contract.address "0x491bC043672B9286fA02FA7e0d6A3E5A0384A31A" \
      --pbft.net.address "127.0.0.1" --pbft.net.port 20020 \
      --pbft.keystore.password "./ethdpos.txt" \
      --syncmode  "full" --gcmode "archive" \
      --pprof --pprofport 6060 \
      --ws --wsaddr "0.0.0.0" --wsport "7111" --wsorigins "*" \
      > ./logs/geth.log 2>&1 &