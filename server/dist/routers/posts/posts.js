"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const supabase_1 = __importDefault(require("../../config/supabase"));
const trpc_1 = require("../../trpc");
const zodSchemas_1 = require("../../types/zodSchemas");
const zod_1 = require("zod");
exports.postRouter = trpc_1.t.router({
    upload: trpc_1.protectedProcedure.input(zodSchemas_1.InputPostSchema).query(async ({ input }) => {
        try {
            if (!input)
                return;
            const { data, error } = await supabase_1.default.from("posts").insert(input).select("*");
            if (error || data.length === 0)
                throw new Error(`Error while inserting a post: ${error}`);
            return data[0];
        }
        catch (error) {
            throw new Error(`Error while uploading: ${error}`);
        }
    }),
    delete: trpc_1.protectedProcedure.input(zod_1.z.string()).mutation(async ({ input }) => {
        try {
            const { error } = await supabase_1.default.from("posts").delete().eq("id", input);
            if (error)
                throw new Error(`Error while deletin post ${error}`);
        }
        catch (err) {
            console.log(err);
        }
    }),
});
//# sourceMappingURL=posts.js.map