"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const action_1 = __importDefault(require("./action"));
async function run() {
    try {
        await (0, action_1.default)();
    }
    catch (error) {
        if (error instanceof Error) {
            // Surface the full stack (and any `cause`) to the Actions run log so
            // failures are debuggable; `core.setFailed` only renders the message.
            core.error(error.stack ?? error.message);
            if (error.cause instanceof Error) {
                core.error(`Caused by: ${error.cause.stack ?? error.cause.message}`);
            }
            else if (error.cause !== undefined) {
                // Stringify via JSON so we don't fall back to "[object Object]" for
                // plain-object causes; fall back to String() for non-serialisable
                // values (e.g. BigInt, circular refs).
                let serialised;
                try {
                    serialised = JSON.stringify(error.cause);
                }
                catch {
                    serialised = Object.prototype.toString.call(error.cause);
                }
                core.error(`Caused by: ${serialised}`);
            }
            core.setFailed(error.message);
        }
        else {
            const message = String(error);
            core.error(message);
            core.setFailed(message);
        }
    }
}
void run();
//# sourceMappingURL=main.js.map