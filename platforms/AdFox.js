
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
    name: 'AdFox',
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
                `<meta name="ad.size" content="width=${width},height=${height}">`
            );

          await insertScriptAfterMarker(releasePath,
                '<script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>',
                `<script nonce="%request.eid1%" src="https://code.createjs.com/1.0.0/createjs.min.js"></script>`,
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


            try {
                await wrapDiv(releasePath, 'animation_container', `<a href="%banner.reference_mrc_user1%" target="%banner.target%">`);
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
