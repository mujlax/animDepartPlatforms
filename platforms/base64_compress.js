
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
    name: 'base64_nocompress',
    process: async (paths, userLink, platformWindow) => {
        userLink = await checkRequestLink(requestLink = false, userLink, platformWindow);

        for (const folderPath of paths) {
            const releasePath = await prepareReleaseFolder(folderPath);
            const { width, height } = getCanvasSize(releasePath);

            console.log(`Обрабатываем папку: ${folderPath}`);
            console.log(`Папка скопирована в ${releasePath}`);
            console.log(`Используемая ссылка: ${userLink}`);






            //await compressImages(releasePath);
            await replaceImagesWithBase64(releasePath);
            // await minifyJSFiles(releasePath);
            //inlineJavaScript(releasePath);
            await deleteFiles(releasePath, ['index_atlas_P_1.png', 'index_atlas_NP_1.jpg', '*.fla']);
            //await archiveFolder(releasePath);
        }
    }
};
