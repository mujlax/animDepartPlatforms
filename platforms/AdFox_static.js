const {
    checkRequestLink,
    prepareReleaseFolder,
    getCanvasSize,
    insertScriptAfterMarker,
    wrapDiv,
    compressImages,
    replaceImagesWithBase64,
    minifyJSFiles,
    inlineJavaScript,
    deleteFiles,
    archiveFolder,
    downloadAndReplaceScript,
    createScreenshotWithTrigger
} = require('./utils/bannerUtils');

const {
    checkStandartTest,
    toggleCommentedBorders,
    checkLoopLimiter,
    checkIndexJsSize,
    checkFpsInIndexJs,
    checkZipSize,
    runTestsForSize,
    checkIndexHtmlSize
} = require('./utils/bannerTests');

function getTestRules(releasePath, width, height) {
    return [
      
        {
            // Правило для баннеров с высотой 200
            height: [120, 150, 180, 250],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>',
                    `<script nonce="%request.eid1%" src="https://code.createjs.com/1.0.0/createjs.min.js"></script>`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script>',
                    `<script nonce="%request.eid1%">`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script src="index.js"></script>',
                    `<script nonce="%request.eid1%" src="index.js"></script>`,
                    true
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`
                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, false),
                () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),
                //() => downloadAndReplaceScript(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                () => checkIndexJsSize(releasePath, maxSizeKB = 300),

                //Optimize Desruct

                //() => inlineJavaScript(releasePath),
                () => checkIndexHtmlSize(releasePath, 65),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 300),

            ]
        }
    ];

}

// Функция для сбора списка поддерживаемых размеров из testRules
function getSupportedSizes(releasePath, width, height) {
    const testRules = getTestRules(releasePath, width, height);
    const sizesList = [];
    testRules.forEach(rule => {
        if (rule.sizes) {
            sizesList.push(...rule.sizes);
        }
        if (rule.height) {
            sizesList.push(...rule.height.map(h => `height: ${h}`));
        }
    });
    return sizesList;
}

module.exports = {
    name: 'Yandex_AdFox (static)',
    process: async (paths, userLink, platformWindow, platformSettings) => {
        userLink = await checkRequestLink(requestLink = false, userLink, platformWindow);


        for (const folderPath of paths) {
            const releasePath = await prepareReleaseFolder(folderPath);
            const { width, height } = getCanvasSize(releasePath);


            //Проверки

            const testRules = getTestRules(releasePath, width, height);
            await runTestsForSize(releasePath, width, height, testRules);

            //await createScreenshotWithTrigger(releasePath, platformSettings);
        }
    },
    getSupportedSizes: (releasePath, width, height) => getSupportedSizes(releasePath, width, height)
};
