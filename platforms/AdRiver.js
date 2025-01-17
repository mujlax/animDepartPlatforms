
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
    name: 'AdRiver(не готов)',
    process: async (paths, userLink, platformWindow) => {
        userLink = await checkRequestLink(requestLink = true, userLink, platformWindow);

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
                '<body onload="init();" style="margin:0px;">',
                `<script type="text/javascript" data-placement="" data-pixel="https://ad.adriver.ru/cgi-bin/json.cgi?sid=1&bt=55&ad=797631&pid=4199130&bid=11370455&bn=11370455&exss=&rnd=![rnd]" src="https://content.adriver.ru/banners/0005728/0005728997/0/AV_pixel.js"></script>`,
            );

            // try {
            //     await wrapDiv(releasePath, 'animation_container', `<div onclick="window.open('${userLink}'); buzzTrack('click');">`);
            //     console.log('Div успешно обёрнут.');
            // } catch (error) {
            //     console.error('Ошибка:', error.message);
            // }

            await compressImages(releasePath);
            //await replaceImagesWithBase64(releasePath);
            // await minifyJSFiles(releasePath);
            //inlineJavaScript(releasePath);
            await deleteFiles(releasePath, ['index.js', 'index_atlas_P_1.png', 'index_atlas_NP_1.jpg', '*.fla']);
            await archiveFolder(releasePath);
        }
    }
};
