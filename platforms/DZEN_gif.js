
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
    checkIndexHtmlSize,
    checkClampMaxWidth
} = require('./utils/bannerTests');

function getTestRules(releasePath, width, height) {
    return [

        {
            // Правило для баннеров с высотой 200
            height: [250, 200],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=100%,height=${height}">`
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="%link1%" target="_blank">`

                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, false),
                () => checkLoopLimiter(releasePath, false),
                () => checkFpsInIndexJs(releasePath),
                () => checkClampMaxWidth(releasePath),
                () => downloadAndReplaceScript(releasePath),

                
                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                // () => checkIndexJsSize(releasePath, maxSizeKB = 200),

                // () => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize (releasePath, 1),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 150),

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
    name: 'DZEN',
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
