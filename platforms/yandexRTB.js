const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { ipcMain } = require('electron');
const { minifyJSFiles, 
    compressImages, 
    replaceImagesWithBase64, 
    inlineJavaScript, 
    copyFolderSync, 
    archiveFolder, 
    deleteFiles, 
    insertScriptAfterMarker, 
    wrapDiv,
    prepareReleaseFolder,
    checkRequestLink,
    downloadAndReplaceScript,
    getCanvasSize
} = require('../bannerUtils');

module.exports = {
    name: 'YandexRTB',
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
                '</body>',
                `<script>document.getElementById("click_area").href = yandexHTML5BannerApi.getClickURLNum(1);</script>\n</body>`,
                true
            );

            try {
                await wrapDiv(releasePath, 'animation_container', `<a id="click_area" href="#" target="_blank">`);
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
