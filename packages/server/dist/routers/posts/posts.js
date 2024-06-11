"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const trpc_1 = require("../../trpc");
const zodSchemas_1 = require("../../types/zodSchemas");
const zod_1 = require("zod");
const posts_1 = require("../../utils/supabase/posts");
exports.postRouter = trpc_1.t.router({
    upload: trpc_1.protectedProcedure.input(zodSchemas_1.InputPostSchema).mutation(async ({ input }) => {
        try {
            if (!input)
                return;
            const { data, error } = await (0, posts_1.uploadPost)(input);
            if (error)
                throw new Error("Error");
            return data;
        }
        catch (error) {
            throw new Error(`Error while uploading: ${error}`);
        }
    }),
    delete: trpc_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), fileKeys: zod_1.z.array(zod_1.z.string()) }))
        .mutation(async ({ input }) => {
        try {
            const { id, fileKeys } = input;
            const err = await (0, posts_1.deletePost)(id, fileKeys);
            if (err)
                console.log("HANDLE: error deleting the post", err);
        }
        catch (err) {
            console.log(err);
        }
    }),
});
//# sourceMappingURL=posts.js.map