 #! /bin/bash
from="/Users/apple/Documents/ElastosWork/src/github.com/elastos/Elastos.ELA.SideChain.ESC/build/bin/geth"
to="/Users/apple/Desktop/layer2Test/layer2/"
for ((i=0; i<=0; i ++))
do
	dir="node"$i
	df=$to$dir
	cp $from $df
	sleep 1
done
