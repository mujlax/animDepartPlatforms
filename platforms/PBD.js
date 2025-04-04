
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
            sizes: ['0×0'
            ],
            tests: [
                () => checkStandartTest(releasePath),
                () => insertScriptAfterMarker(releasePath,
                    '<meta charset="UTF-8">',
                    `<meta name="ad.size" content="width=${width},height=${height}">`
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>',
                    `<script type="text/javascript" src="https://ds.serving-sys.ru/BurstingCachedScripts/libraries/createjs/1_0_0/createjs.min.js"></script>
                 <script type="text/javascript" src="https://ds.serving-sys.ru/BurstingScript/EBLoader.js"></script>
                 <style type="text/css">
                 body { margin:0px; overflow-x: hidden; }
                 #canvas { cursor: pointer; width: ${width}px; height: ${height}px; }
                 </style>`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    'var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;',
                    `function isLocal(){
                   return \`(sizmek.ru|file:///|localhost|192.168.|127.0.0.1)/.test(\${window.location.href});\`
                 }
                 function clickthrough1(){
                    EB.clickthrough();
                    if(isLocal()){
                       console.log('> click');
                    }
                 }
                 function initEB() {
                    if (!EB.isInitialized()) {
                       EB.addEventListener(EBG.EventName.EB_INITIALIZED, startAd);
                    } else {
                       startAd();
                    }
                 }
                 function startAd() {
                    init();
                 }
                 if(isLocal()){
                    console.log(' -- Sizmek, 2018-10-12 -- ');
                 }
                var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<body onload="init();" style="margin:0px;">',
                    `<body onload="initEB();">`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    'loader.loadManifest(lib.properties.manifest);',
                    `anim_container.addEventListener('click', clickthrough1);`
                ),
                // () => wrapDiv(releasePath,
                //     'animation_container',
                //     `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`

                // ),
                
                () => toggleCommentedBorders(releasePath, true),
                () => checkLoopLimiter(releasePath, true),
                //() => checkFpsInIndexJs(releasePath),
                //() => checkClampMaxWidth(releasePath),
                //() => downloadAndReplaceScript(releasePath),


                () => compressImages(releasePath),
                //() => replaceImagesWithBase64(releasePath),
                () => minifyJSFiles(releasePath),
                // () => checkIndexJsSize(releasePath, maxSizeKB = 200),

                // () => inlineJavaScript(releasePath),
                // () => checkIndexHtmlSize (releasePath, 1),
                () => archiveFolder(releasePath),
                () => checkZipSize(releasePath, 220),

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
    name: 'PBD (тестировать)',
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
