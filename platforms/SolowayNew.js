
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
            sizes: ['0×0'
            ],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                // () => wrapDiv(releasePath,
                //     'animation_container',
                //     `<div id="Stage">`
                // ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                // () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),
                //() => downloadAndReplaceScript(releasePath),

                // Optimize

                () => compressImages(releasePath),
                () => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                () => checkIndexJsSize(releasePath, maxSizeKB = 600),

                //Optimize Desruct

                //() => inlineJavaScript(releasePath),
                () => checkIndexHtmlSize(releasePath, 600),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 150),

            ]
        },
        {
            // Правило для баннеров с высотой 200
            height: [0],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=100%,height=${height}">`
                ),
                // () => wrapDiv(releasePath,
                //     'animation_container',
                //     `<div id="Stage">`
                // ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                // () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                () => checkIndexJsSize(releasePath, maxSizeKB = 600),

                // Optimize Desruct

                //() => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize(releasePath, 150),
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
    name: 'Soloway',
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
