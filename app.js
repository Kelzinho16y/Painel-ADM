// Função para enviar o APK
async function uploadAPK() {
    const fileInput = document.getElementById('apkFile');
    const file = fileInput.files[0];

    if (!file || !file.name.endsWith('.apk')) {
        alert("Por favor, selecione um arquivo APK válido.");
        return;
    }

    const uploadButton = document.getElementById('uploadButton');
    uploadButton.textContent = "Enviando...";
    uploadButton.disabled = true;

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = "block"; // Mostrar a barra de progresso

    const fileName = file.name;
    const storageRef = storage.ref().child(`apks/${fileName}`);

    console.log("Iniciando upload do arquivo:", fileName);

    try {
        // Enviar o arquivo e monitorar o progresso
        const uploadTask = storageRef.put(file);

        // Monitora o progresso do upload
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
                console.log('Progresso do upload: ' + progress + '%');
            }, 
            (error) => {
                console.error("Erro ao enviar o APK:", error);
                alert("Falha ao enviar o APK: " + error.message);
            }, 
            async () => {
                // Upload concluído com sucesso
                const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
                console.log("URL de download obtida:", downloadUrl);

                // Salvar dados no Firestore
                await db.collection("versions").add({
                    version: fileName.replace('.apk', ''),
                    description: "Nova versão carregada pelo admin",
                    downloadUrl: downloadUrl
                });

                alert("APK enviado com sucesso!");
                fileInput.value = "";
                document.getElementById('fileName').textContent = "Nenhum arquivo selecionado";
                loadVersions();

                // Resetar a barra de progresso
                progressBar.style.width = '0%';
                progressContainer.style.display = 'none'; // Ocultar a barra de progresso
            }
        );

    } catch (error) {
        console.error("Erro ao enviar o APK:", error);
        alert("Falha ao enviar o APK: " + error.message);
    } finally {
        uploadButton.textContent = "Enviar APK";
        uploadButton.disabled = false;
    }
}
