
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
            sizes: ['160×600', '240×400', '240×600', '300×250', '300×300', '300×500', '300×600', '320×50', '320×100', '320×480', '336×280', '480×320', '728×90', '970×250', '1000×120'
            ],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '</body>',
                    `<script>document.getElementById("click_area").href = yandexHTML5BannerApi.getClickURLNum(1);</script>\n</body>`,
                    true
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a id="click_area" href="#" target="_blank">`
                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, true),
                () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),
                //() => downloadAndReplaceScript(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                //() => checkIndexJsSize(releasePath, maxSizeKB = 10),

                //Optimize Desruct

                //() => inlineJavaScript(releasePath),
                () => checkIndexHtmlSize(releasePath, 150),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 512),

            ]
        },
        {
            // Правило для баннеров с высотой 200
            height: [120, 150, 180, 250],
            tests: [
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=100%,height=${height}">`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '</body>',
                    `<script>document.getElementById("click_area").href = yandexHTML5BannerApi.getClickURLNum(1);</script>\n</body>`,
                    true
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a id="click_area" href="#" target="_blank">`
                ),
                () => checkStandartTest(releasePath),
                () => toggleCommentedBorders(releasePath, false),
                () => checkLoopLimiter(releasePath, false),
                //() => checkFpsInIndexJs(releasePath),

                // Optimize

                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                //() => checkIndexJsSize(releasePath, maxSizeKB = 10),

                // Optimize Desruct

                //() => inlineJavaScript(releasePath),
                () => checkIndexHtmlSize(releasePath, 150),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 512),

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
    name: 'Yandex_Direct',
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
