module.exports = {
    name: "six-handed-ng",
    preset: "../../jest.config.js",
    coverageDirectory: "../../coverage/apps/six-handed-ng",
    snapshotSerializers: [
        "jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js",
        "jest-preset-angular/build/AngularSnapshotSerializer.js",
        "jest-preset-angular/build/HTMLCommentSerializer.js",
    ],
};
