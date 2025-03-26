
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
    name: 'Weborama',
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
                '<title>index</title>',
                `<script type="text/javascript" src="https://cstatic-ru-cv.weborama-tech.ru/public/js/advertiserv2/ru/screenad_interface_1.0.3_scrambled.js"></script>
<!-- write your code here -->
<!-- ADRIME SCREENAD META DATA (don't edit/remove) -->
<!-- SCRVERSION: screenad_interface_1.0.3 -->
<!-- SCRFORMAT: banner -->
<!-- SCRWIDTH: ${width} -->
<!-- SCRHEIGHT: ${height} -->`
            );

          

          await insertScriptAfterMarker(releasePath,
                '<script src="index.js"></script>',
                `<script>var _bnrR = 0;</script>`
            );


          await downloadAndReplaceScript(releasePath);

            try {
                await wrapDiv(releasePath, 'animation_container', `<a href="javascript:screenad.click('default')">`);
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
