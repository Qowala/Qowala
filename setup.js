'use strict'
const webpush = require('web-push');

// VAPID keys should only be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

const fs = require('fs');
const VAPID_PRIVATE_ENV = '\n' + 'QOWALA_VAPID_PRIVATE=' + vapidKeys.privateKey;
const VAPID_PUBLIC_ENV = '\n' + 'QOWALA_VAPID_PUBLIC=' + vapidKeys.publicKey;

// Write Vapid keys in env file
fs.appendFile('.env', VAPID_PRIVATE_ENV, function (err) {
});
fs.appendFile('.env', VAPID_PUBLIC_ENV, function (err) {
});
