

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

function getTestRules(releasePath, width, height, userLink) {
    return [
        {
            sizes: ['320x250', '300x600'
            ],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<!-- write your code here -->',
                    '<script type="text/javascript" src="https://tube.buzzoola.com/new/js/lib/banner.js"></script>'
                ),
                () => insertScriptAfterMarker(releasePath,
                    '</body>',
                    `<script type="text/javascript">buzzTrack('loaded');</script>\n</body>`,
                    true
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<div onclick="window.open('${userLink}'); buzzTrack('click');">`
                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),
                //() => downloadAndReplaceScript(releasePath),

                // Optimize

                () => compressImages(releasePath),
                () => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                //() => checkIndexJsSize(releasePath, maxSizeKB = 10),

                //Optimize Desruct

                () => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize(releasePath, 500),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 500),

            ]
        },

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
    name: 'Avito',
    process: async (paths, userLink, platformWindow, platformSettings) => {
        userLink = await checkRequestLink(requestLink = true, userLink, platformWindow);


        for (const folderPath of paths) {
            const releasePath = await prepareReleaseFolder(folderPath);
            const { width, height } = getCanvasSize(releasePath);


            //Проверки
            const testRules = getTestRules(releasePath, width, height, userLink);

            await runTestsForSize(releasePath, width, height, testRules);

            //await createScreenshotWithTrigger(releasePath, platformSettings);
        }
    },
    getSupportedSizes: (releasePath, width, height) => getSupportedSizes(releasePath, width, height)
};
