#!/bin/sh

if [ ! -f /config/config.toml ]; then
    echo "Audible-cli config not found. Running interactive setup."
    audible quickstart
    echo "Audible setup complete. Starting server."
fi

bun run setup.js
bun run server.js
