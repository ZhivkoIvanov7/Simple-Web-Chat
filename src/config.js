const config = {
    development: {
        PORT: 5000,
    }
}

module.exports = config[process.env.node_env || "development"]