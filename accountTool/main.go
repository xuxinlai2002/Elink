package main

import (
	"fmt"
	"github.com/elastos/Elastos.ELA.SideChain.ESC/common"
	"github.com/elastos/Elastos.ELA.SideChain.ESC/crypto"
	"github.com/elastos/Elastos.ELA/account"
	daccount "github.com/elastos/Elastos.ELA/dpos/account"
	"os"
)

func main() {

	if len(os.Args) == 2 && (os.Args[1] == "-h" || os.Args[1] == "-help") {
		fmt.Println("./accountTool <keystore path> <password> <data>")
		return
	}

	if len(os.Args) < 4 {
		fmt.Println("parameter length is not enough !")
		return
	}

	keystorePath := os.Args[1]
	password := os.Args[2]
	data := os.Args[3]

	account ,err := GetDposAccount(
		keystorePath, []byte(password))
	if err != nil {
		fmt.Printf("error: %+v",err)
	}else{

		first := crypto.Keccak256(common.Hex2Bytes(data))
		// fmt.Printf("data: %s\n",common.Bytes2Hex(first))
		data := merge(first,first)
		// hexData := common.Bytes2Hex(data)

		sig := account.Sign(data)
		hexSig := common.Bytes2Hex(sig)
		pubKey := account.PublicKeyBytes()
		hexPubKey := common.Bytes2Hex(pubKey)

		fmt.Printf("publick key: %s\n",hexPubKey)
		// fmt.Printf("data       : %s\n",hexData)
		fmt.Printf("signature  : %s\n",hexSig)
	}

}


func GetDposAccount(keystorePath string, password []byte) (daccount.Account, error) {

	client, err := account.Open(keystorePath, password)
	if err != nil {
		return nil, err
	}

	return daccount.New(client.GetMainAccount()), nil
}


func merge(first , second []byte) []byte{
	var merged []byte
	k := 0
	for i := 0; i < len(first); i++ {
		merged = append(merged ,first[i])
		k++
	}

	for i := 0; i < len(second); i++ {
		merged = append(merged ,second[i])
		k++
	}
	return merged
}
