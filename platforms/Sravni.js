
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
                    `<script nonce="%request.eid1%" src="https://cdn.jsdelivr.net/npm/createjs@1.0.1/builds/1.0.0/createjs.min.js"></script>`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script>',
                    `<script nonce="%request.eid1%">`,
                    true
                    
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script src="index.js"></script>',
                    `<script nonce="%request.eid1%" src="index.js"></script>`
                    
                ),
                () => insertScriptAfterMarker(releasePath,
                    '</head>',
                    `<style type="text/css">
	* {
		margin: 0px;
		padding: 0px;
		box-sizing: border-box;
	}
	.banner, .frame, .fon {
		position: absolute;
		overflow: hidden;
		cursor: pointer;
		width: 100%;
		height: 90px;
		z-index: 20;
		border-radius: 20px;
	}
	#animation_container {
		border-radius: 20px;
	}
	#canvas {
		border-radius: 20px;
		width: 100% !important; 
		height: auto !important;
	}
	#dom_overlay_container {
		border-radius: 20px;
		border: none !important;
	}
	.frame {
		pointer-events: none;
		border: 1px solid #dadada;
		z-index: 150;
	}
	.fon {
		left: 0px;
		z-index: 10;
		background: #000;
	}
</style>`
                    
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`
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
                    `<script nonce="%request.eid1%" src="https://cdn.jsdelivr.net/npm/createjs@1.0.1/builds/1.0.0/createjs.min.js"></script>`,
                    true
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script>',
                    `<script nonce="%request.eid1%">`,
                    true
                    
                ),
                () => insertScriptAfterMarker(releasePath,
                    '<script src="index.js"></script>',
                    `<script nonce="%request.eid1%" src="index.js"></script>`
                    
                ),
                () => insertScriptAfterMarker(releasePath,
                    '</head>',
                    `<style type="text/css">
	* {
		margin: 0px;
		padding: 0px;
		box-sizing: border-box;
	}
	.banner, .frame, .fon {
		position: absolute;
		overflow: hidden;
		cursor: pointer;
		width: 100%;
		height: 90px;
		z-index: 20;
		border-radius: 20px;
	}
	#animation_container {
		border-radius: 20px;
	}
	#canvas {
		border-radius: 20px;
		width: 100% !important; 
		height: auto !important;
	}
	#dom_overlay_container {
		border-radius: 20px;
		border: none !important;
	}
	.frame {
		pointer-events: none;
		border: 1px solid #dadada;
		z-index: 150;
	}
	.fon {
		left: 0px;
		z-index: 10;
		background: #000;
	}
</style>`
                    
                ),
                () => wrapDiv(releasePath,
                    'animation_container',
                    `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`
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
    name: 'Sravni (no test)',
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
