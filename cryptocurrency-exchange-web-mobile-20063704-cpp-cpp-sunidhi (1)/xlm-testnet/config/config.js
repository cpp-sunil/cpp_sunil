const convict = require('convict');

// Define a schema
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
        default: 9042,
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
            default: 'sParaWallets',
        },
        auth_source: {
            doc: "Define the database to authenticate against",
            format: String,
            default: "admin",
        },
        auth_user: {
            doc: "The username for auth",
            format: String,
            default: "sP",
        },
        auth_password: {
            doc: "The password for auth",
            format: String,
            default: "sPPwd",
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
        default: "rippleService"// process.env.JWTSECRET,
    },
    rippled: {
        doc: "rippled server",
        format: String,
        default: 'ws://167.99.37.73:6006'
    },
    rippleFeeTemp:{
        doc: "This is temporary static fee for ripple. Later a function will return the val",
        format: String,
        default: '0.000012'
    }
});

// Load environment dependent configuration
config.loadFile('./config/' + config.get('env') + '.json');

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config;

