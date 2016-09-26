#!/bin/sh

GENERATING_FILE="gen_colormap.js"
TMP_FILE="colormap.js"
GENERATED_FILE="colormap.min.js"

if npm -v > /dev/null; then
    echo 'npm found!'
else
    echo 'npm not found, please download node and npm'
    exit 3
fi

if npm list colormap | grep colormap > /dev/null; then
    echo 'colormap found!'
else
    echo 'colormap module not found, installing locally'
    npm install colormap
fi

if npm list -g browserify | grep browserify > /dev/null; then
    echo 'browserify found!'
else
    echo 'browserify module not found, installing globally'
    sudo npm install -g browserify
fi

if npm list -g uglifyjs | grep uglifyjs > /dev/null; then
    echo 'uglifyjs found!'
else
    echo 'uglifyjs module not found, installing globally'
    sudo npm install -g uglifyjs
fi


if browserify $GENERATING_FILE -o $TMP_FILE; then
    uglifyjs $TMP_FILE -o $GENERATED_FILE --comments "/license|License/"
    rm $TMP_FILE
    echo 'generated colormap.min.js'
else
    echo 'failed to generate colormap.js'
fi
