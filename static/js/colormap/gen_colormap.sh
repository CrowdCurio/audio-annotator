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


if browserify gen_colormap.js -o colormap.js; then
    uglifyjs colormap.js -o colormap.min.js --comments "/license|License/"
    rm colormap.js
    echo 'generated colormap.min.js'
else
    echo 'failed to generate colormap.js'
fi
