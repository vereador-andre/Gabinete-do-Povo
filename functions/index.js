const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.enviarNotificacaoManual = onDocumentCreated("fila_notificacoes/{docId}", async (event) => {
  const snap = event.data;
  if (!snap) return;

  const dados = snap.data();
  if (!dados || dados.status !== "pendente") return;

  const db = admin.firestore();
  const tokensSnap = await db.collection("tokens_notificacoes").get();

  if (tokensSnap.empty) {
    await snap.ref.update({
      status: "sem_destinatarios",
      processadoEm: admin.firestore.FieldValue.serverTimestamp(),
      totalEnviados: 0
    });
    return;
  }

  const tokens = [];
  tokensSnap.forEach((doc) => {
    const t = doc.data().token || doc.id;
    if (t) tokens.push(t);
  });

  const mensagem = {
    notification: {
      title: dados.title || "Gabinete do Povo",
      body: dados.body || "Há novidades no aplicativo de André de Dedé."
    },
    data: {
      url: dados.url || "./app.html",
      categoria: dados.categoria || "geral"
    },
    tokens: tokens
  };

  try {
    const resposta = await admin.messaging().sendEachForMulticast(mensagem);

    // Limpa tokens expirados ou desinstalados automaticamente
    const remocoes = [];
    resposta.responses.forEach((res, idx) => {
      if (!res.success && res.error) {
        const codigo = res.error.code;
        if (
          codigo === "messaging/invalid-registration-token" ||
          codigo === "messaging/registration-token-not-registered"
        ) {
          remocoes.push(db.collection("tokens_notificacoes").doc(tokens[idx]).delete());
        }
      }
    });
    if (remocoes.length > 0) {
      await Promise.all(remocoes);
    }

    await snap.ref.update({
      status: "enviado",
      processadoEm: admin.firestore.FieldValue.serverTimestamp(),
      totalEnviados: resposta.successCount,
      totalFalhas: resposta.failureCount
    });
  } catch (erro) {
    console.error("Erro ao disparar notificações FCM:", erro);
    await snap.ref.update({
      status: "erro",
      erroDetalhe: erro.message || "Falha no envio",
      processadoEm: admin.firestore.FieldValue.serverTimestamp()
    });
  }
});
