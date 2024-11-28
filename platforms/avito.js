const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { ipcMain } = require('electron');
const bannerUtils = require('../bannerUtils');

module.exports = {
    name: 'АвитоНаАвито',
    process: async (paths, userLink, platformWindow) => {
        userLink = await bannerUtils.checkRequestLink(requestLink = false, userLink, platformWindow);

        for (const folderPath of paths) {
            const releasePath = await bannerUtils.prepareReleaseFolder(folderPath);
            const { width, height } = bannerUtils.getCanvasSize(releasePath);

            console.log(`Обрабатываем папку: ${folderPath}`);
            console.log(`Папка скопирована в ${releasePath}`);
            console.log(`Используемая ссылка: ${userLink}`);


            await bannerUtils.insertScriptAfterMarker(releasePath,
                '<!-- write your code here -->',
                '<script type="text/javascript" src="https://tube.buzzoola.com/new/js/lib/banner.js"></script>'
            );

            await bannerUtils.insertScriptAfterMarker(releasePath,
                '<meta charset="UTF-8">',
                `<meta name="ad.size" content="width=${width},height=${height}">`
            );

            await bannerUtils.insertScriptAfterMarker(releasePath,
                '</body>',
                `<script type="text/javascript">buzzTrack('loaded');</script>\n</body>`,
                true
            );

            try {
                await bannerUtils.wrapDiv(releasePath, 'animation_container', `<div onclick="window.open('${userLink}'); buzzTrack('click');">`);
                console.log('Div успешно обёрнут.');
            } catch (error) {
                console.error('Ошибка:', error.message);
            }

            await bannerUtils.compressImages(releasePath);
            await bannerUtils.replaceImagesWithBase64(releasePath);
            // await bannerUtils.minifyJSFiles(releasePath);
            bannerUtils.inlineJavaScript(releasePath);
            await bannerUtils.deleteFiles(releasePath, ['index.js', 'index_atlas_P_1.png', 'index_atlas_NP_1.jpg', '*.fla']);
            await bannerUtils.archiveFolder(releasePath);
        }
    }
};
