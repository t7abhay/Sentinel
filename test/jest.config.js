// jest.config.js
export default {
    testEnvironment: "node",
    transform: {}, // disable babel since Node handles ESM
    extensionsToTreatAsEsm: [".js"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
