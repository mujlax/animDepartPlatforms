const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { ipcMain } = require('electron');
const bannerUtils = require('../bannerUtils');

module.exports = {
    name: 'Mail_Main',
    process: async (paths, userLink, platformWindow) => {
        userLink = await bannerUtils.checkRequestLink(requestLink = false, userLink, platformWindow);

        for (const folderPath of paths) {
            const releasePath = await bannerUtils.prepareReleaseFolder(folderPath);
            const { width, height } = bannerUtils.getCanvasSize(releasePath);
            console.log(`height ${height}`);

            console.log(`Обрабатываем папку: ${folderPath}`);
            console.log(`Папка скопирована в ${releasePath}`);
            console.log(`Используемая ссылка: ${userLink}`);


            await bannerUtils.insertScriptAfterMarker(releasePath,
                '<meta charset="UTF-8">',
                `<meta name="ad.size" content="width=100%,height=${height}">`
            );
            

            await bannerUtils.downloadAndReplaceScript(releasePath);

            try {
                await bannerUtils.wrapDiv(releasePath, 'banner', `<a href="%link1%" target="_blank">`);
                console.log('Div успешно обёрнут.');
            } catch (error) {
                console.error('Ошибка:', error.message);
            }


            await bannerUtils.compressImages(releasePath);
            // await bannerUtils.replaceImagesWithBase64(releasePath);
            await bannerUtils.minifyJSFiles(releasePath);
            // bannerUtils.inlineJavaScript(releasePath);
            await bannerUtils.deleteFiles(releasePath, ['*.fla']);
            await bannerUtils.archiveFolder(releasePath);
        }
    }
};
