const convict = require('convict');

let config = convict({
    env: {
        doc: "The application environment.",
        format: ["production", "development", "test"],
        default: "development",
        env: "NODE_ENV",
        arg: "env",
    },
    url: {
        doc: "The Server to bind.",
        format: "url",
        default: "http://172.16.1.128",
        env: "SERVER_URL",
    },
    port: {
        doc: "The port to bind.",
        format: "port",
        default: 9041,
        env: "PORT",
        arg: "port",
    },
    mongodb: {
        host: {
            doc: "Database host name/IP",
            format: '*',
            default: 'mongodb://localhost/',
        },
        name: {
            doc: "Database name",
            format: String,
            default: 'ripple',
        },
        auth_source: {
            doc: "Define the database to authenticate against",
            format: String,
            default: "",
        },
        auth_user: {
            doc: "The username for auth",
            format: String,
            default: "",
        },
        auth_password: {
            doc: "The password for auth",
            format: String,
            default: "",
        },
        replicaSet: {
            rsName: {
                doc: "Replica Set name for mongodb",
                format: String,
                default: "",
            },
            debug: {
                doc: "Replica Set debug",
                format: Boolean,
                default: true,
            },
        },
    },
    jwtSecretKey: {
        doc: "JWT(JSON Web Token) value",
        format: String,
        default: "rippleService"
    },
    rippled: {
        doc: "rippled server",
        format: String,
        // default: 'wss://s1.ripple.com/' mainnet
    },
    rippleFeeTemp:{
        doc: "Ripple fee",
        format: String,
        default: '0.000012'
    }
});

config.loadFile('./config/' + config.get('env') + '.json');

config.validate({allowed: 'strict'});

module.exports = config;
