
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
                () => insertScriptAfterMarker(releasePath,
                    '<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>',
                    `<script src="https://s0.2mdn.net/ads/studio/cached_libs/createjs_2019.11.15_min.js"></script>`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<title>index</title>',
                    `<script type="text/javascript">var clickTag = "";</script>`,
                    true
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="javascript:window.open(window.clickTag)">`
                ),
                () => checkStandartTest(releasePath),
                // () => toggleCommentedBorders(releasePath, true),
                // () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),
                //() => downloadAndReplaceScript(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                //() => checkIndexJsSize(releasePath, maxSizeKB = 10),

                //Optimize Desruct

                //() => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize(releasePath, 150),
                () => archiveFolder(releasePath),
                // () => checkZipSize(releasePath, 512),

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
                () => insertScriptAfterMarker(releasePath,
                    '<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>',
                    `<script src="https://s0.2mdn.net/ads/studio/cached_libs/createjs_2019.11.15_min.js"></script>`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<title>index</title>',
                    `<script type="text/javascript">var clickTag = "";</script>`,
                    true
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="javascript:window.open(window.clickTag)">`
                ),
                () => checkStandartTest(releasePath),
                // () => toggleCommentedBorders(releasePath, false),
                // () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                //() => checkIndexJsSize(releasePath, maxSizeKB = 10),

                // Optimize Desruct

                //() => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize(releasePath, 150),
                () => archiveFolder(releasePath),
                // () => checkZipSize(releasePath, 512),

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
    name: 'OTM_beeline (no test)',
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
