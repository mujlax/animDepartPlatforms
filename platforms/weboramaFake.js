
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
            height: [0],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<title>index</title>',
                    `<script type="text/javascript" src="https://cstatic-ru-cv.weborama-tech.ru/public/js/advertiserv2/ru/screenad_interface_1.0.3_scrambled.js"></script>
<!-- write your code here -->
<!-- ADRIME SCREENAD META DATA (don't edit/remove) -->
<!-- SCRVERSION: screenad_interface_1.0.3 -->
<!-- SCRFORMAT: banner -->
<!-- SCRWIDTH: ${width} -->
<!-- SCRHEIGHT: ${height} -->`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script src="index.js"></script>',
                    `<script>var _bnrR = 0;</script>`
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="javascript:screenad.click('default')">`

                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                () => checkLoopLimiter(releasePath, true),
                () => checkFpsInIndexJs(releasePath),
                //() => checkClampMaxWidth(releasePath),
                () => downloadAndReplaceScript(releasePath),

                
                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                // () => checkIndexJsSize(releasePath, maxSizeKB = 200),

                // () => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize (releasePath, 1),
                () => archiveFolder(releasePath),
                //() => checkZipSize(releasePath, 150),

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
    name: 'Weborama (fake static)',
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
