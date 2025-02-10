
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
    downloadAndReplaceScript
} = require('./utils/bannerUtils');

module.exports = {
    name: 'Sravni_100prc',
    process: async (paths, userLink, platformWindow) => {
        userLink = await checkRequestLink(requestLink = false, userLink, platformWindow);

        for (const folderPath of paths) {
            const releasePath = await prepareReleaseFolder(folderPath);
            const { width, height } = getCanvasSize(releasePath);

            console.log(`Обрабатываем папку: ${folderPath}`);
            console.log(`Папка скопирована в ${releasePath}`);
            console.log(`Используемая ссылка: ${userLink}`);


            await insertScriptAfterMarker(releasePath,
                '<meta charset="UTF-8">',
                `<meta name="ad.size" content="width=100%,height=${height}">`
            );

          await insertScriptAfterMarker(releasePath,
                '<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>',
                `<script nonce="%request.eid1%" src="https://cdn.jsdelivr.net/npm/createjs@1.0.1/builds/1.0.0/createjs.min.js"></script>`,
                true
            );

          await insertScriptAfterMarker(releasePath,
                '<script>',
                `<script nonce="%request.eid1%">`,
                true
            );

		await insertScriptAfterMarker(releasePath,
                '<script src="index.js"></script>',
                `<script nonce="%request.eid1%" src="index.js"></script>`,
                true
            );

           await insertScriptAfterMarker(releasePath,
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
            );


            try {
                await wrapDiv(releasePath, 'banner', `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`);
                console.log('Div успешно обёрнут.');
            } catch (error) {
                console.error('Ошибка:', error.message);
            }

            await compressImages(releasePath);
            //await replaceImagesWithBase64(releasePath);
            await minifyJSFiles(releasePath);
            //inlineJavaScript(releasePath);
            await deleteFiles(releasePath, ['*.fla']);
            await archiveFolder(releasePath);
        }
    }
};
