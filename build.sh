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

function buildMacArm64Electron() {
    cd "$electron" || exit
    yarn package --arch=arm64 --platform=darwin
}

function buildMacX64Electron() {
    cd "$electron" || exit
    yarn package --arch=x64 --platform=darwin
}

function buildWindowsElectron() {
    cd "$electron" || exit
    yarn package --platform win32
}

if [ "$1" == mac ]; then
    echo "build on mac"

    if [ "$2" == all ]; then
        buildClient
        if [ "$3" == arm64 ]; then
            buildMacArm64Electron
        elif [ "$3" == x64 ]; then
            buildMacX64Electron
        else
            buildMacArm64Electron
            buildMacX64Electron
        fi
    elif [ "$2" == client ]; then
        buildClient
    elif [ "$2" == electron ]; then
        if [ "$3" == arm64 ]; then
            buildMacArm64Electron
        elif [ "$3" == x64 ]; then
            buildMacX64Electron
        else
            buildMacArm64Electron
            buildMacX64Electron
        fi
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
