"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = exports.deleteS3Object = exports.s3KeyExtractor = exports.s3KeyConstructor = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../config/config");
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_BUCKETNAME, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_URL } = config_1.env;
const s3 = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
const s3KeyConstructor = (data) => {
    const { name, folder } = data;
    return `${AWS_BUCKET_URL}/${folder}/${name}`;
};
exports.s3KeyConstructor = s3KeyConstructor;
const s3KeyExtractor = (name) => {
    if (name.startsWith(AWS_BUCKET_URL)) {
        const p = name.split(AWS_BUCKET_URL)[1];
        const id = p.indexOf("/");
        return p.slice(id + 1);
    }
    else {
        return name;
    }
};
exports.s3KeyExtractor = s3KeyExtractor;
const deleteS3Object = async (key) => {
    let name = key;
    if (key.startsWith(AWS_BUCKET_URL)) {
        name = (0, exports.s3KeyExtractor)(name);
    }
    const params = {
        Bucket: AWS_BUCKETNAME,
        Key: name,
    };
    const deleteCommand = new client_s3_1.DeleteObjectCommand(params);
    await s3.send(deleteCommand);
};
exports.deleteS3Object = deleteS3Object;
const uploadToS3 = async ({ folder, key, data, }) => {
    try {
        const params = {
            Bucket: AWS_BUCKETNAME,
            Key: `${folder}/${key}`,
            Body: data,
        };
        const uploadCommand = new client_s3_1.PutObjectCommand(params);
        const result = await s3.send(uploadCommand);
        console.log("File uploaded successfully:", result);
    }
    catch (error) {
        console.error("Error uploading file:", error);
    }
};
exports.uploadToS3 = uploadToS3;
//# sourceMappingURL=s3.js.map