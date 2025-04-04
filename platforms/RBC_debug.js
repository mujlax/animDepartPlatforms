
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
            sizes: ['240x400', '300x250', '300x600'],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`
                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                () => checkLoopLimiter(releasePath, true),
                () => checkFpsInIndexJs(releasePath),
                //() => downloadAndReplaceScript(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                () => checkIndexJsSize(releasePath, maxSizeKB = 10),

                //Optimize Desruct

                // () => inlineJavaScript(releasePath),
                () => checkIndexHtmlSize(releasePath, 10),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 10),

            ]
        },
        {
            // Правило для баннеров с высотой 200
            height: [250, 400],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=100%,height=${height}">`
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`
                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                () => checkLoopLimiter(releasePath, false),
                () => checkFpsInIndexJs(releasePath),

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                () => checkIndexJsSize(releasePath, maxSizeKB = 1),

                () => inlineJavaScript(releasePath),
                () => checkIndexHtmlSize(releasePath, 1),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 1),

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
    name: 'RBC (не использовать)',
    process: async (paths, userLink, platformWindow, platformSettings) => {
        userLink = await checkRequestLink(requestLink = false, userLink, platformWindow);

        for (const folderPath of paths) {
            const releasePath = await prepareReleaseFolder(folderPath);
            const { width, height } = getCanvasSize(releasePath);


            //Проверки
            // Получаем тестовые правила с передачей releasePath, width и height
            const testRules = getTestRules(releasePath, width, height);

            // Сохраняем список размеров в настройках платформы
            //platformSettings.supportedSizes = getSupportedSizes(releasePath, width, height);



            await runTestsForSize(releasePath, width, height, testRules);

            //await createScreenshotWithTrigger(releasePath, platformSettings);
        }
    },
    getSupportedSizes: (releasePath, width, height) => getSupportedSizes(releasePath, width, height)
};
