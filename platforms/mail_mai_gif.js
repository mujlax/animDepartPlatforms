
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

module.exports = {
    name: 'Mail_Main_100prc',
    process: async (paths, userLink, platformWindow, platformSettings) => {
        userLink = await checkRequestLink(requestLink = false, userLink, platformWindow);

        for (const folderPath of paths) {
            const releasePath = await prepareReleaseFolder(folderPath);
            const { width, height } = getCanvasSize(releasePath);
            console.log(`height ${height}`);

            console.log(`Обрабатываем папку: ${folderPath}`);
            console.log(`Папка скопирована в ${releasePath}`);
            console.log(`Используемая ссылка: ${userLink}`);


            await insertScriptAfterMarker(releasePath,
                '<meta charset="UTF-8">',
                `<meta name="ad.size" content="width=100%,height=${height}">`
            );
            

            await downloadAndReplaceScript(releasePath);

            try {
                await wrapDiv(releasePath, 'banner', `<a href="%link1%" target="_blank">`);
                console.log('Div успешно обёрнут.');
            } catch (error) {
                console.error('Ошибка:', error.message);
            }


            await compressImages(releasePath);
            // await replaceImagesWithBase64(releasePath);
            await minifyJSFiles(releasePath);
            // bannerUtils.inlineJavaScript(releasePath);
            
            await deleteFiles(releasePath, ['*.fla']);
            await archiveFolder(releasePath);
            await createScreenshotWithTrigger(folderPath, platformSettings);
        }
    }
};
