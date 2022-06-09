#!/bin/bash

# kill geth process
geths=`ps -ef | grep geth | awk '{print $2}'`

for g in $geths
do
    echo "kill process geth id $g"
    kill -s SIGINT $g
     # kill -9 $g
done

# kill ela process
ids=`ps -ef | grep ela\[0-9\] | awk '{print $2}'`

for id in $ids
do
    echo "kill process ela id $id"
    kill -9 $id
done

# ids=`ps -ef | grep ela | awk '{print $2}'`

# for id in $ids
# do
#     echo "kill process ela id $id"
#     kill -9 $id
# done

# ids=`ps -ef | grep bootnode | awk '{print $2}'`

# for id in $ids
# do
#     echo "kill process ela id $id"
#     kill -9 $id
# done

# ids=`ps -ef | grep ela | awk '{print $2}'`

# for id in $ids
# do
#     echo "kill process ela id $id"
#     kill -9 $id
# done

# kill arbiter process
ids=`ps -ef | grep arbiter\[0-9\] | awk '{print $2}'`

for id in $ids
do
    echo "kill process arbiter id $id"
    kill -9 $id
done

# kill did process
ids=`ps -ef | grep did\[0-9\] | awk '{print $2}'`

for id in $ids
do
    echo "kill process did id $id"
    kill -9 $id
done

# kill token process
ids=`ps -ef | grep token\[0-9\] | awk '{print $2}'`

for id in $ids
do
    echo "kill process token id $id"
    kill -9 $id
done

# kill neo process
ids=`ps -ef | grep neo\[0-9\] | awk '{print $2}'`

for id in $ids
do
    echo "kill process neo id $id"
    kill -9 $id
done


echo "kill all processes!"
