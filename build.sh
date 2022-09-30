current=$(pwd)
client=$current/client
electron=$current/electron

function buildClient() {
    echo "build client ..."
    # build client
    cd "$client" || exit
    yarn build

    # clean resources
    cd "$current" || exit
    rm -rf electron/src/dist/*
    cp -R client/dist/* electron/src/dist
}

function buildMacElectron() {
    cd "$electron" || exit
    yarn make
}

function buildWindowsElectron() {
    cd "$electron" || exit
    yarn package --platform win32
}

if [ "$1" == mac ]; then
    echo "build on mac"

    if [ "$2" == all ]; then
        buildClient
        buildMacElectron
    elif [ "$2" == client ]; then
        buildClient
    elif [ "$2" == electron ]; then
        buildMacElectron
    else
        echo "no build target"
        exit
    fi

    echo "build on mac success"
elif [ "$1" == windows ]; then
    echo "build on windows"

    if [ "$2" == all ]; then
        buildClient
        buildWindowsElectron
    elif [ "$2" == client ]; then
        buildClient
    elif [ "$2" == electron ]; then
        buildWindowsElectron
    else
        echo "no build target"
        exit
    fi

    echo "build on windows success"
else
    echo "not support"
fi
