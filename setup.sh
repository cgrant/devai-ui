#!/bin/bash

source config-env.sh

export BASE_DIR=$PWD

cd ${BASE_DIR}/frontend
./setup.sh
cd $BASE_DIR

cd ${BASE_DIR}/cloud-functions
./setup.sh
cd $BASE_DIR

cd ${BASE_DIR}/backend-job
./setup.sh
cd $BASE_DIR